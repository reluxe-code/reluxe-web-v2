import { createClient } from '../../lib/supabase/server';
import AdminImagePreview from '../../components/dashboard/AdminImagePreview';

type SubmissionRow = {
  id: string;
  created_at: string;
  raw_image_path?: string | null;
  raw_image_url?: string | null;
  extracted_data?: {
    patient_name?: string;
    provider?: string;
    treatment_plan?: Array<{ plan?: string }>;
    [key: string]: unknown;
  } | null;
};

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div>Error loading submissions</div>;

  const rows = (submissions || []) as SubmissionRow[];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="mb-8 text-2xl font-bold">Form Submissions</h1>
      <div className="grid gap-6">
        {rows.map((sub) => {
          const filePath = sub.raw_image_path || sub.raw_image_url || '';
          const extracted = sub.extracted_data || {};
          const plan0 =
            Array.isArray(extracted.treatment_plan) && extracted.treatment_plan[0]
              ? extracted.treatment_plan[0]?.plan
              : null;

          return (
            <div key={sub.id} className="flex items-start gap-6 rounded-2xl bg-white p-6 shadow-sm">
              {filePath ? <AdminImagePreview filePath={filePath} /> : <div className="h-24 w-24 rounded-lg bg-slate-200" />}

              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold">{extracted.patient_name || 'Unnamed Patient'}</h3>
                  <span className="text-sm text-slate-400">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <p className="mb-4 text-sm text-slate-500">Provider: {extracted.provider || 'Unknown'}</p>

                <div className="rounded-lg border bg-slate-50 p-3 text-xs">
                  <strong>Plan Snippet:</strong> {plan0 || 'No plan listed'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
