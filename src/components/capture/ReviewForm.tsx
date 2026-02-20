'use client';

import { useEffect, useMemo, useState } from 'react';

type TreatmentRow = {
  plan?: string | null;
  frequency?: string | null;
  priority?: string | null;
};

type ReviewData = {
  form_type?: string | null;
  patient_name?: string | null;
  provider?: string | null;
  treatment_plan?: TreatmentRow[];
  [key: string]: unknown;
};

type ReviewFormProps = {
  initialData: Record<string, unknown>;
  filePath: string;
  previewUrl?: string;
  onApprove: () => void;
};
export default function ReviewForm({ initialData, filePath, previewUrl, onApprove }: ReviewFormProps) {
  const [data, setData] = useState<ReviewData>(initialData as ReviewData);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const proxyImageUrl = useMemo(
    () => (filePath ? `/capture/api/file?path=${encodeURIComponent(filePath)}` : ''),
    [filePath]
  );
  const stableImageUrl = useMemo(() => previewUrl || proxyImageUrl, [previewUrl, proxyImageUrl]);
  const [imageSrc, setImageSrc] = useState(stableImageUrl);

  useEffect(() => {
    setImageSrc(stableImageUrl);
    setImageError('');
  }, [stableImageUrl]);

  const saveToSupabase = async () => {
    setSaving(true);
    try {
      const resp = await fetch('/capture/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: data.form_type || 'Aesthetician Plan',
          filePath,
          extractedData: data,
        }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(json?.error || 'Approve failed');
      }
      alert('Form Saved Successfully!');
      onApprove();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      alert(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const rows = Array.isArray(data.treatment_plan) ? data.treatment_plan : [];

  if (!stableImageUrl) return <div className="p-4 text-white">Loading secure image...</div>;

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
        <h2 className="text-lg font-bold">Review Form</h2>
        <button
          onClick={saveToSupabase}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Approve'}
        </button>
      </div>

      <div className="p-4">
        <img
          src={imageSrc}
          className="mb-6 h-72 w-full rounded-xl border object-contain shadow-sm"
          alt="Captured form"
          onError={() => {
            if (previewUrl && imageSrc !== previewUrl) {
              setImageSrc(previewUrl);
              return;
            }
            if (proxyImageUrl && imageSrc !== proxyImageUrl) {
              setImageSrc(proxyImageUrl);
              return;
            }
            setImageError('Could not load image preview. You can still approve and view it from Form Submissions.');
          }}
        />
        {imageError ? <p className="mb-6 text-sm text-rose-600">{imageError}</p> : null}
        <div className="mb-6 text-xs text-slate-500">
          <a className="underline" href={stableImageUrl} target="_blank" rel="noreferrer">
            Open image directly
          </a>
          <span className="ml-2 break-all">Path: {filePath || 'none'}</span>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Patient Name"
              value={(data.patient_name as string) || ''}
              onChange={(val) => setData({ ...data, patient_name: val })}
            />
            <InputField
              label="Provider"
              value={(data.provider as string) || ''}
              onChange={(val) => setData({ ...data, provider: val })}
            />
          </div>

          <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">Treatment Plan</h3>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Plan</th>
                  <th className="p-2 text-left">Freq</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2">
                      <input
                        className="w-full focus:outline-none"
                        value={row.plan || ''}
                        onChange={(e) => {
                          const newPlan = [...rows];
                          newPlan[i] = { ...newPlan[i], plan: e.target.value };
                          setData({ ...data, treatment_plan: newPlan });
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="w-full focus:outline-none"
                        value={row.frequency || ''}
                        onChange={(e) => {
                          const newPlan = [...rows];
                          newPlan[i] = { ...newPlan[i], frequency: e.target.value };
                          setData({ ...data, treatment_plan: newPlan });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500">{label}</label>
      <input
        className="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-blue-500"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
