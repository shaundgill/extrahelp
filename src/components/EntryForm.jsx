import { useEffect, useState } from 'react'
import { TRACKING_START_DATE, FLOAT_AP_NAMES, DOC_EXTRA_NAMES } from '../lib/rosters'
import { todayISO } from '../lib/dateUtils'

const OTHER = 'Other / unnamed'

function rosterFor(type) {
  return type === 'AP' ? FLOAT_AP_NAMES : DOC_EXTRA_NAMES
}

function emptyExtra(type) {
  return { type, selection: rosterFor(type)[0], customName: '' }
}

// Convert a saved {type, name} into the form's {type, selection, customName} shape.
function toDraft(extra) {
  const roster = rosterFor(extra.type)
  if (roster.includes(extra.name)) {
    return { type: extra.type, selection: extra.name, customName: '' }
  }
  return { type: extra.type, selection: OTHER, customName: extra.name }
}

function resolveName(ex) {
  if (ex.type === 'Doc') {
    return ex.customName.trim() || 'Unnamed physician'
  }
  if (ex.selection === OTHER) {
    return ex.customName.trim() || OTHER
  }
  return ex.selection
}

const emptyForm = { date: todayISO(), census: '', extras: [] }

function isDuplicateDate(date, existingDates, editingEntry) {
  return existingDates.has(date) && date !== editingEntry?.date
}

export default function EntryForm({ onSave, saving, editingEntry, onCancelEdit, existingDates }) {
  const [date, setDate] = useState(emptyForm.date)
  const [census, setCensus] = useState(emptyForm.census)
  const [extras, setExtras] = useState(emptyForm.extras)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date)
      setCensus(editingEntry.census == null ? '' : String(editingEntry.census))
      setExtras(editingEntry.extras.map(toDraft))
      setError('')
    } else {
      setDate(todayISO())
      setCensus('')
      setExtras([])
      setError('')
    }
  }, [editingEntry])

  function addExtra(type) {
    setExtras((prev) => [...prev, emptyExtra(type)])
  }

  function updateExtra(idx, field, value) {
    setExtras((prev) => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)))
  }

  function removeExtra(idx) {
    setExtras((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date) {
      setError('Pick a date first.')
      return
    }
    if (date < TRACKING_START_DATE) {
      setError(`Tracking starts ${TRACKING_START_DATE}.`)
      return
    }
    if (isDuplicateDate(date, existingDates, editingEntry)) {
      setError(
        editingEntry
          ? 'That date already has an entry. Edit that one directly instead.'
          : "That day's already logged. Use Edit on it in the log below instead."
      )
      return
    }
    setError('')
    await onSave({
      id: editingEntry ? editingEntry.id : undefined,
      originalDate: editingEntry ? editingEntry.date : undefined,
      date,
      census: census === '' ? null : Math.round(Number(census)),
      extras: extras.map((ex) => ({ type: ex.type, name: resolveName(ex) })),
    })
    if (!editingEntry) {
      setCensus('')
      setExtras([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-ink">{editingEntry ? 'Edit day' : 'Log a day'}</h2>
        {editingEntry && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-inksoft hover:text-ink">
            Cancel edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-inksoft mb-1" htmlFor="entry-date">Date</label>
          <input
            id="entry-date"
            type="date"
            min={TRACKING_START_DATE}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          {isDuplicateDate(date, existingDates, editingEntry) && (
            <p className="text-xs text-alert mt-1">Already logged — use Edit below instead.</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-inksoft mb-1" htmlFor="entry-census">Census</label>
          <input
            id="entry-census"
            type="number"
            placeholder="e.g. 116"
            value={census}
            onChange={(e) => setCensus(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {extras.length > 0 && (
        <div className="space-y-2">
          {extras.map((ex, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-center">
              <select
                value={ex.type}
                onChange={(e) => {
                  const type = e.target.value
                  updateExtra(idx, 'type', type)
                  updateExtra(idx, 'selection', rosterFor(type)[0])
                  updateExtra(idx, 'customName', '')
                }}
                className="border border-line rounded-md px-2 py-2 text-sm w-24"
              >
                <option value="AP">AP</option>
                <option value="Doc">Physician</option>
              </select>
              {ex.type === 'AP' ? (
                <>
                  <select
                    value={ex.selection}
                    onChange={(e) => updateExtra(idx, 'selection', e.target.value)}
                    className="border border-line rounded-md px-2 py-2 text-sm flex-1 min-w-[140px]"
                  >
                    {rosterFor('AP').map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {ex.selection === OTHER && (
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={ex.customName}
                      onChange={(e) => updateExtra(idx, 'customName', e.target.value)}
                      className="border border-line rounded-md px-2 py-2 text-sm flex-1 min-w-[140px]"
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Physician's name (optional)"
                  value={ex.customName}
                  onChange={(e) => updateExtra(idx, 'customName', e.target.value)}
                  className="border border-line rounded-md px-2 py-2 text-sm flex-1 min-w-[140px]"
                />
              )}
              <button
                type="button"
                aria-label="Remove"
                onClick={() => removeExtra(idx)}
                className="text-inksoft hover:text-alert px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => addExtra('AP')}
          className="text-sm border border-line rounded-md px-3 py-1.5 hover:bg-teal-50 hover:border-teal-600 transition-colors"
        >
          + Extra AP
        </button>
        <button
          type="button"
          onClick={() => addExtra('Doc')}
          className="text-sm border border-line rounded-md px-3 py-1.5 hover:bg-amber-50 hover:border-amber-600 transition-colors"
        >
          + Extra physician
        </button>
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={saving || isDuplicateDate(date, existingDates, editingEntry)}
        className="w-full bg-ink text-white rounded-md py-2 font-medium hover:bg-teal-800 transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : editingEntry ? 'Save changes' : 'Save day'}
      </button>
      {!editingEntry && (
        <p className="text-xs text-inksoft">
          Saving a date that's already logged overwrites that day — use this to correct entries,
          or use Edit on a log entry below.
        </p>
      )}
    </form>
  )
}
