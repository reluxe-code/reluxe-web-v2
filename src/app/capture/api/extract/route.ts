import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildModelCandidates() {
  const envModel = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
  ];
  return [...new Set([envModel, ...defaults].filter(Boolean))] as string[];
}

function normalizeExtraction(input: any, formType: string) {
  const source = input && typeof input === 'object' ? input : {};
  const treatmentPlan = Array.isArray((source as any).treatment_plan)
    ? (source as any).treatment_plan
        .map((row: any) => ({
          plan: row?.plan ? String(row.plan).trim() : null,
          frequency: row?.frequency ? String(row.frequency).trim() : null,
          priority: row?.priority ? String(row.priority).trim() : null,
        }))
        .filter((row: any) => row.plan || row.frequency || row.priority)
    : [];

  return {
    form_type: (source as any).form_type || formType || 'consult',
    patient_name: (source as any).patient_name || (source as any).consult_name || null,
    consult_name: (source as any).consult_name || (source as any).patient_name || null,
    location: (source as any).location || null,
    provider: (source as any).provider || null,
    date: (source as any).date || null,
    areas_of_concern: Array.isArray((source as any).areas_of_concern) ? (source as any).areas_of_concern : [],
    skin_assessment: Array.isArray((source as any).skin_assessment) ? (source as any).skin_assessment : [],
    treatment_plan: treatmentPlan,
    low_confidence: Boolean((source as any).low_confidence),
  };
}

async function fetchSupportedGenerateModels(apiKey: string) {
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!resp.ok) return [];
    const json = await resp.json();
    const models = Array.isArray(json?.models) ? json.models : [];
    return models
      .filter((m: any) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => String(m?.name || '').replace(/^models\//, ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY on server.' }, { status: 500 });
    }

    const { filePath, formType, mimeType } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
    }

    const prompt = `You are extracting structured data from a medical aesthetics paper form photo.
Return ONLY valid JSON and do not include markdown.
Never invent values. If uncertain, use null and set low_confidence=true.

Required JSON shape:
{
  "form_type": "${formType}",
  "patient_name": string | null,
  "consult_name": string | null,
  "location": string | null,
  "provider": string | null,
  "date": string | null,
  "areas_of_concern": string[],
  "skin_assessment": string[],
  "treatment_plan": [{"plan": string | null, "frequency": string | null, "priority": string | null}],
  "low_confidence": boolean
}

Rules:
- patient_name and consult_name should match if only one name is present.
- Parse only checked/selected items into areas_of_concern and skin_assessment.
- treatment_plan rows should only include rows with at least one non-empty cell.
- Keep text exactly as written where possible.`;

    const { data: signed, error: signError } = await supabase.storage
      .from('form-captures')
      .createSignedUrl(filePath, 600);

    if (signError) {
      return NextResponse.json({ error: signError.message }, { status: 500 });
    }

    const imgFetch = await fetch(signed.signedUrl);
    if (!imgFetch.ok) {
      return NextResponse.json({ error: `Failed to fetch signed image (${imgFetch.status})` }, { status: 500 });
    }
    const imageResp = await imgFetch.arrayBuffer();
    const resolvedMimeType = mimeType || imgFetch.headers.get('content-type') || 'image/jpeg';

    const modelCandidates = buildModelCandidates();
    let result: any = null;
    let lastError: unknown = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: Buffer.from(imageResp).toString('base64'),
              mimeType: resolvedMimeType,
            },
          },
        ]);
        break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!result) {
      const message = lastError instanceof Error ? lastError.message : 'Gemini request failed';
      const availableModels = await fetchSupportedGenerateModels(process.env.GEMINI_API_KEY!);
      return NextResponse.json(
        {
          error: 'Gemini extraction failed for all configured models.',
          detail: message,
          triedModels: modelCandidates,
          availableModels,
          hint:
            availableModels.length > 0
              ? `Set GEMINI_MODEL to one of: ${availableModels.slice(0, 8).join(', ')}`
              : 'Set GEMINI_MODEL to a currently supported model for your key.',
        },
        { status: 502 }
      );
    }

    const raw = result.response.text().replace(/```json|```/g, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'Gemini returned non-JSON output', rawPreview: raw.slice(0, 400) },
        { status: 502 }
      );
    }

    return NextResponse.json({
      extracted: normalizeExtraction(parsed, formType),
      filePath,
      signedUrl: signed.signedUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected extract error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
