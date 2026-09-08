import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import MetricCard from './MetricCard'
import EntryForm from './EntryForm'
import ExtraHelpChart from './ExtraHelpChart'
import CensusChart from './CensusChart'
import CensusTrendChart from './CensusTrendChart'
import CompositionDonut from './CompositionDonut'
import EntryLog from './EntryLog'
import { TRACKING_START_DATE, BASELINE } from '../lib/rosters'
import { todayISO, daysBetweenInclusive } from '../lib/dateUtils'
import { groupEntries } from '../lib/grouping'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [granularity, setGranularity] = useState('Week')

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('extra_help_entries')
      .select('*')
      .gte('entry_date', TRACKING_START_DATE)
      .order('entry_date', { ascending: true })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setEntries(
        (data || []).map((row) => ({
          id: row.id,
          date: row.entry_date,
          census: row.census,
          extras: row.extras || [],
        }))
      )
    }
    setLoading(false)
  }

  async function handleSave({ id, originalDate, date, census, extras }) {
    setSaving(true)
    setErrorMsg('')
    const { error } = await supabase
      .from('extra_help_entries')
      .upsert({ entry_date: date, census, extras }, { onConflict: 'entry_date' })

    if (error) {
      setSaving(false)
      setErrorMsg(error.message)
      return
    }

    // If editing and the date changed, the upsert above created/updated a row
    // under the new date, so the old row (different date, same id) is now a
    // stale duplicate — remove it.
    if (id && originalDate && originalDate !== date) {
      const { error: deleteError } = await supabase.from('extra_help_entries').delete().eq('id', id)
      if (deleteError) {
        setErrorMsg(deleteError.message)
      }
    }

    setSaving(false)
    setEditingEntry(null)
    await loadEntries()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('extra_help_entries').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      if (editingEntry?.id === id) setEditingEntry(null)
    }
  }

  function handleEdit(entry) {
    setEditingEntry(entry)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const metrics = useMemo(() => {
    const daysLogged = entries.length
    let apCount = 0
    let docCount = 0
    let daysWithExtra = 0
    let censusExtraSum = 0
    let censusExtraN = 0

    entries.forEach((e) => {
      const ap = e.extras.filter((x) => x.type === 'AP').length
      const doc = e.extras.filter((x) => x.type === 'Doc').length
      apCount += ap
      docCount += doc
      const hasExtra = ap + doc > 0
      if (hasExtra) daysWithExtra++
      if (e.census != null && hasExtra) {
        censusExtraSum += e.census
        censusExtraN++
      }
    })

    const totalCalendarDays = Math.max(1, daysBetweenInclusive(TRACKING_START_DATE, todayISO()))
    const pct = Math.round((daysWithExtra / totalCalendarDays) * 100)
    const avgCensusExtra = censusExtraN ? Math.round(censusExtraSum / censusExtraN) : null

    return { daysLogged, apCount, docCount, daysWithExtra, totalCalendarDays, pct, avgCensusExtra }
  }, [entries])

  const grouped = useMemo(() => groupEntries(entries, granularity), [entries, granularity])

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <p className="text-xs text-inksoft">Hospitalist coverage · since {TRACKING_START_DATE}</p>
          <h1 className="font-serif text-2xl text-ink">Extra help tracker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section>
          <p className="text-xs text-inksoft mb-2">
            Baseline model: {BASELINE.roundingDocs} rounding docs (~{BASELINE.roundingDocsSweetSpot} encounters each), {BASELINE.admittingDocs} admitting doc (11a–9p), {BASELINE.coreAPs} core APs.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Days logged" value={metrics.daysLogged} />
            <MetricCard
              label="Days needing extra help"
              value={`${metrics.pct}%`}
              sublabel={`${metrics.daysWithExtra} of ${metrics.totalCalendarDays} days`}
              accent={metrics.pct >= 50 ? 'text-alert' : undefined}
            />
            <MetricCard label="Extra AP instances" value={metrics.apCount} accent="text-teal-600" />
            <MetricCard label="Extra physician instances" value={metrics.docCount} accent="text-amber-600" />
          </div>
          {metrics.avgCensusExtra != null && (
            <div className="mt-3 max-w-[calc(50%-0.375rem)]">
              <MetricCard
                label="Avg census on extra-help days"
                value={metrics.avgCensusExtra}
                accent="text-alert"
              />
            </div>
          )}
        </section>

        {errorMsg && (
          <p className="text-sm text-alert bg-white border border-line rounded-md px-3 py-2">{errorMsg}</p>
        )}

        <div className="flex justify-end">
          <div className="flex border border-line rounded-md overflow-hidden text-xs bg-white">
            {['Week', 'Month', 'Day'].map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 ${
                  granularity === g ? 'bg-ink text-white' : 'text-inksoft hover:bg-paper'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <ExtraHelpChart data={grouped} />
        <CensusChart data={grouped} granularity={granularity} />
        <CensusTrendChart entries={entries} />
        <CompositionDonut apCount={metrics.apCount} docCount={metrics.docCount} />

        <div className="grid md:grid-cols-2 gap-6">
          <EntryForm
            onSave={handleSave}
            saving={saving}
            editingEntry={editingEntry}
            onCancelEdit={() => setEditingEntry(null)}
            existingDates={new Set(entries.map((e) => e.date))}
          />
          <EntryLog
            entries={entries}
            onDelete={handleDelete}
            onEdit={handleEdit}
            editingId={editingEntry?.id}
          />
        </div>

        {loading && <p className="text-sm text-inksoft">Loading…</p>}
      </main>
    </div>
  )
}
