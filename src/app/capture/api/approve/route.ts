import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { formType, filePath, extractedData } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
    }
    if (!extractedData || typeof extractedData !== 'object') {
      return NextResponse.json({ error: 'Missing extractedData' }, { status: 400 });
    }

    let { error } = await supabase.from('form_submissions').insert([
      {
        form_type: formType || extractedData?.form_type || 'Aesthetician Plan',
        raw_image_path: filePath,
        extracted_data: extractedData,
        status: 'approved',
      },
    ]);

    // Backward compatibility if raw_image_path does not exist in this environment.
    if (error && /raw_image_path/i.test(error.message || '')) {
      const fallback = await supabase.from('form_submissions').insert([
        {
          form_type: formType || extractedData?.form_type || 'Aesthetician Plan',
          raw_image_url: filePath,
          extracted_data: extractedData,
          status: 'approved',
        },
      ]);
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected approve error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

