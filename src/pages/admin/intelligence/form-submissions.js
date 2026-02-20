import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminImagePreview from '@/components/dashboard/AdminImagePreview'
import { supabase } from '@/lib/supabase'

export default function AdminFormSubmissionsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      const { data, error: qErr } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!mounted) return
      if (qErr) {
        setError(qErr.message || 'Failed to load submissions')
        setRows([])
      } else {
        setRows(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Captured paper forms reviewed and approved from the secure capture workflow.
        </p>
      </div>

      {loading ? <div className="rounded-xl border bg-white p-6 text-sm text-neutral-500">Loading submissions...</div> : null}
      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error ? (
        <div className="grid gap-4">
          {rows.map((sub) => {
            const extracted = sub?.extracted_data || {}
            const plan0 = Array.isArray(extracted?.treatment_plan) && extracted.treatment_plan[0]
              ? extracted.treatment_plan[0]?.plan
              : null
            const filePath = sub?.raw_image_path || sub?.raw_image_url || extracted?.raw_image_path || extracted?.raw_image_url || ''
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelected(sub)}
                className="flex items-start gap-5 rounded-xl border bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-sm"
              >
                {filePath ? <AdminImagePreview filePath={filePath} /> : <div className="h-24 w-24 rounded-lg bg-neutral-200" />}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h2 className="truncate text-lg font-semibold">{extracted?.patient_name || 'Unnamed Patient'}</h2>
                    <div className="shrink-0 text-xs text-neutral-500">
                      {sub?.created_at ? new Date(sub.created_at).toLocaleString() : 'Unknown date'}
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-neutral-600">
                    Provider: {extracted?.provider || 'Unknown'} | Form: {sub?.form_type || 'Unknown'}
                  </p>
                  <div className="rounded-lg border bg-neutral-50 p-3 text-xs text-neutral-700">
                    <span className="font-semibold">Plan snippet:</span> {plan0 || 'No plan listed'}
                  </div>
                </div>
              </button>
            )
          })}

          {rows.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
              No form submissions yet.
            </div>
          ) : null}
        </div>
      ) : null}

      {selected ? (
        <SubmissionDrawer sub={selected} onClose={() => setSelected(null)} />
      ) : null}
    </AdminLayout>
  )
}

function SubmissionDrawer({ sub, onClose }) {
  const extracted = sub?.extracted_data || {}
  const filePath = sub?.raw_image_path || sub?.raw_image_url || extracted?.raw_image_path || extracted?.raw_image_url || ''
  const treatment = Array.isArray(extracted?.treatment_plan) ? extracted.treatment_plan : []
  const areas = Array.isArray(extracted?.areas_of_concern) ? extracted.areas_of_concern : []
  const skin = Array.isArray(extracted?.skin_assessment) ? extracted.skin_assessment : []
  const followUps = Array.isArray(extracted?.follow_ups) ? extracted.follow_ups : []

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-label="Close drawer overlay" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{extracted?.patient_name || 'Submission'}</h2>
            <p className="text-xs text-neutral-500">{sub?.created_at ? new Date(sub.created_at).toLocaleString() : 'Unknown date'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">Close</button>
        </div>

        <div className="space-y-6 p-5">
          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Captured Image</h3>
            {filePath ? (
              <AdminImagePreview
                filePath={filePath}
                className="h-auto max-h-[70vh] w-full cursor-zoom-in rounded-lg border object-contain shadow-sm"
              />
            ) : (
              <p className="text-sm text-neutral-500">No image path on record.</p>
            )}
            <p className="mt-2 break-all text-xs text-neutral-400">Path: {filePath || 'none'}</p>
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Patient Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Patient" value={extracted?.patient_name || extracted?.consult_name} />
              <Detail label="Provider" value={extracted?.provider} />
              <Detail label="Location" value={extracted?.location} />
              <Detail label="Date" value={extracted?.date} />
              <Detail label="Form Type" value={sub?.form_type || extracted?.form_type} />
              <Detail label="Low Confidence" value={String(Boolean(extracted?.low_confidence))} />
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Clinical Inputs</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Areas of Concern</p>
                {areas.length ? <ul className="space-y-1">{areas.map((x, i) => <li key={i}>• {x}</li>)}</ul> : <p className="text-neutral-500">None</p>}
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Skin Assessment</p>
                {skin.length ? <ul className="space-y-1">{skin.map((x, i) => <li key={i}>• {x}</li>)}</ul> : <p className="text-neutral-500">None</p>}
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Treatment Plan</h3>
            {treatment.length ? (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="p-2 text-left">Plan</th>
                      <th className="p-2 text-left">Frequency</th>
                      <th className="p-2 text-left">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatment.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{row?.plan || '-'}</td>
                        <td className="p-2">{row?.frequency || '-'}</td>
                        <td className="p-2">{row?.priority || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No treatment rows extracted.</p>
            )}
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Follow-ups & Outcomes</h3>
            {followUps.length ? (
              <ul className="space-y-2 text-sm">
                {followUps.map((f, i) => (
                  <li key={i} className="rounded-md border bg-neutral-50 p-2">
                    <span className="font-medium">{f?.channel || 'Follow-up'}</span>: {f?.status || 'sent'} {f?.sent_at ? `(${f.sent_at})` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                No Bird follow-up events are attached yet. We can wire this to message events + booking conversion next.
              </p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Detail label="Booked After Follow-up" value={String(Boolean(extracted?.booked_after_followup))} />
              <Detail label="Booking ID" value={extracted?.booking_id || extracted?.appointment_id} />
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-2 text-sm font-semibold">Raw JSON</h3>
            <pre className="max-h-72 overflow-auto rounded bg-neutral-950 p-3 text-xs text-neutral-200">
              {JSON.stringify(extracted, null, 2)}
            </pre>
          </section>
        </div>
      </aside>
    </>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="truncate">{value || '-'}</p>
    </div>
  )
}
