'use client';

import { useMemo, useState } from 'react';
import ReviewForm from '@/components/capture/ReviewForm';

type ExtractedData = Record<string, unknown> | null;
type Step = 'lock' | 'capture' | 'processing' | 'review' | 'menu';

const FALLBACK_PIN = '123456';

export default function CapturePage() {
  const accessPin = useMemo(() => process.env.NEXT_PUBLIC_CAPTURE_PIN || FALLBACK_PIN, []);

  const [step, setStep] = useState<Step>('lock');
  const [pin, setPin] = useState('');
  const [formType, setFormType] = useState('consult');
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState('');
  const [previewSignedUrl, setPreviewSignedUrl] = useState('');
  const [capturedData, setCapturedData] = useState<ExtractedData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function readJsonSafe(resp: Response) {
    const text = await resp.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response (${resp.status}): ${text.slice(0, 200)}`);
    }
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pin === accessPin) {
      setStep('capture');
      setError('');
      return;
    }
    setError('Invalid 6-digit code.');
  }

  async function handleProcess() {
    if (!file) {
      setError('Please take or select a photo first.');
      return;
    }
    const isHeic =
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      /\.hei(c|f)$/i.test(file.name);
    if (isHeic) {
      setError('HEIC images are not supported yet. Please upload JPG or PNG.');
      return;
    }

    setLoading(true);
    setStep('processing');
    setError('');
    setCapturedData(null);

    try {
      const uploadBody = new FormData();
      uploadBody.append('file', file);

      const uploadResp = await fetch('/capture/api/upload', {
        method: 'POST',
        body: uploadBody,
      });

      const uploadJson = await readJsonSafe(uploadResp);
      if (!uploadResp.ok) throw new Error(uploadJson.error || 'Upload failed');

      setFilePath(uploadJson.filePath || '');
      setPreviewSignedUrl(uploadJson.signedUrl || '');

      const extractResp = await fetch('/capture/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: uploadJson.filePath, formType, mimeType: uploadJson.mimeType }),
      });

      const extractJson = await readJsonSafe(extractResp);
      if (!extractResp.ok) {
        const parts = [extractJson.error || 'Extraction failed', extractJson.detail, extractJson.hint]
          .filter(Boolean)
          .join(' ');
        throw new Error(parts || 'Extraction failed');
      }

      setPreviewSignedUrl(extractJson.signedUrl || uploadJson.signedUrl || '');
      setCapturedData(extractJson.extracted ?? extractJson);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setStep('capture');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🤖</div>
          <h2 className="mb-2 text-2xl font-semibold">AI is reading the form</h2>
          <p className="mb-6 text-slate-300">boop... scanning fields... boop... extracting treatment plan...</p>
          <div className="mb-3 flex items-center justify-center gap-3 text-sm text-slate-300">
            <span className="rounded-md border border-slate-600 px-2 py-1">📷 Upload</span>
            <span>→</span>
            <span className="rounded-md border border-slate-600 px-2 py-1">🧠 Parse</span>
            <span>→</span>
            <span className="rounded-md border border-slate-600 px-2 py-1">📝 Review</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review' && capturedData) {
    return (
      <ReviewForm
        initialData={capturedData}
        filePath={filePath}
        previewUrl={previewSignedUrl}
        onApprove={() => setStep('menu')}
      />
    );
  }

  if (step === 'menu') {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-white">
        <div className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold">Saved</h1>
          <p className="mb-4 text-slate-300">The form has been approved and stored.</p>
          <button
            onClick={() => {
              setFile(null);
              setFilePath('');
              setPreviewSignedUrl('');
              setCapturedData(null);
              setError('');
              setStep('capture');
            }}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500"
          >
            Capture Another
          </button>
        </div>
      </main>
    );
  }

  if (step === 'lock') {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 text-white">
        <form onSubmit={handleUnlock} className="w-full space-y-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
          <h1 className="text-2xl font-semibold">Capture Lock</h1>
          <p className="text-sm text-slate-300">Enter the 6-digit code to continue.</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 tracking-[0.25em]"
            placeholder="••••••"
          />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button className="w-full rounded-lg bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500">Unlock</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10 text-white">
      <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Form Capture</h1>
          <p className="text-sm text-slate-300">Take a photo, upload to Supabase, then extract with Gemini.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Form type</span>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            >
              <option value="consult">Consult</option>
              <option value="intake">Intake</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white"
            />
          </label>
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || !file}
          className="rounded-lg bg-fuchsia-600 px-4 py-2 font-medium hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Processing...' : 'Upload + Extract'}
        </button>

        {previewSignedUrl ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Temporary Preview URL</p>
            <a href={previewSignedUrl} target="_blank" rel="noreferrer" className="break-all text-sm text-violet-300 hover:underline">
              {previewSignedUrl}
            </a>
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </div>
    </main>
  );
}
