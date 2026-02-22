import { useRef, useEffect } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function ComparisonTable({ config, articleSlug }) {
  const { title, columns = [], rows = [], highlight_column } = config || {}
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current && columns.length && rows.length) {
      tracked.current = true
      trackWidgetEvent('table_view', 'ComparisonTable', articleSlug, { title, columns: columns.length, rows: rows.length })
    }
  }, [columns.length, rows.length, title, articleSlug])

  if (!columns.length || !rows.length) return null

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white overflow-hidden">
      {title && <h3 className="text-lg font-bold text-neutral-900 px-6 pt-5 pb-2">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left font-semibold ${
                    i === highlight_column ? 'text-violet-700 bg-violet-50' : 'text-neutral-600'
                  } ${i === 0 ? 'pl-6' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b last:border-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 ${
                      ci === 0 ? 'pl-6 font-medium text-neutral-800' : 'text-neutral-600'
                    } ${ci === highlight_column ? 'bg-violet-50 text-violet-700 font-medium' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
