import { useState } from 'react'
import { TRACKING_START_DATE, FLOAT_AP_NAMES, DOC_EXTRA_NAMES } from '../lib/rosters'
import { todayISO } from '../lib/dateUtils'

function emptyExtra(type) {
  return { type, name: type === 'AP' ? FLOAT_AP_NAMES[0] : DOC_EXTRA_NAMES[0] }
}

export default function EntryForm({ onSave, saving }) {
  const [date, setDate] = useState(todayISO())
  const [census, setCensus] = useState('')
  const [extras, setExtras] = useState([])
  const [error, setError] = useState('')

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
    setError('')
    await onSave({
      date,
      census: census === '' ? null : Math.round(Number(census)),
      extras,
    })
    setCensus('')
    setExtras([])
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 space-y-4">
      <h2 className="font-serif text-lg text-ink">Log a day</h2>

      <div className="grid grid-cols-2 gap-3">
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
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={ex.type}
                onChange={(e) => {
                  const type = e.target.value
                  updateExtra(idx, 'type', type)
                  updateExtra(idx, 'name', type === 'AP' ? FLOAT_AP_NAMES[0] : DOC_EXTRA_NAMES[0])
                }}
                className="border border-line rounded-md px-2 py-2 text-sm w-24"
              >
                <option value="AP">AP</option>
                <option value="Doc">Physician</option>
              </select>
              <select
                value={ex.name}
                onChange={(e) => updateExtra(idx, 'name', e.target.value)}
                className="border border-line rounded-md px-2 py-2 text-sm flex-1"
              >
                {(ex.type === 'AP' ? FLOAT_AP_NAMES : DOC_EXTRA_NAMES).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
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
        disabled={saving}
        className="w-full bg-ink text-white rounded-md py-2 font-medium hover:bg-teal-800 transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save day'}
      </button>
      <p className="text-xs text-inksoft">
        Saving a date that's already logged overwrites that day — use this to correct entries.
      </p>
    </form>
  )
}
