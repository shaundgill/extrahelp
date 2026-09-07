import { formatDateLong } from '../lib/dateUtils'

export default function EntryLog({ entries, onDelete }) {
  const sorted = [...entries].sort((a, b) => (a.date > b.date ? -1 : 1))

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-line rounded-lg p-5">
        <h2 className="font-serif text-lg text-ink mb-2">Log</h2>
        <p className="text-sm text-inksoft">No days logged yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <h2 className="font-serif text-lg text-ink mb-4">Log</h2>
      <div className="space-y-3">
        {sorted.map((e) => {
          const ap = e.extras.filter((x) => x.type === 'AP')
          const doc = e.extras.filter((x) => x.type === 'Doc')
          return (
            <div key={e.id} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  {formatDateLong(e.date)}
                  {e.census != null && <span className="text-inksoft font-normal"> · census {e.census}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ap.map((x, i) => (
                    <span key={'ap' + i} className="text-xs bg-teal-50 text-teal-800 rounded-full px-2 py-0.5">
                      AP · {x.name}
                    </span>
                  ))}
                  {doc.map((x, i) => (
                    <span key={'doc' + i} className="text-xs bg-amber-50 text-amber-800 rounded-full px-2 py-0.5">
                      Doc · {x.name}
                    </span>
                  ))}
                  {ap.length === 0 && doc.length === 0 && (
                    <span className="text-xs text-inksoft">No extra help</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(e.id)}
                aria-label={`Delete entry for ${e.date}`}
                className="text-inksoft hover:text-alert text-sm shrink-0"
              >
                Delete
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
