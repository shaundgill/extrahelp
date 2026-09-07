import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import MetricCard from './MetricCard'
import EntryForm from './EntryForm'
import ExtraHelpChart from './ExtraHelpChart'
import EntryLog from './EntryLog'
import { TRACKING_START_DATE, BASELINE } from '../lib/rosters'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  async function handleSave({ date, census, extras }) {
    setSaving(true)
    setErrorMsg('')
    const { error } = await supabase
      .from('extra_help_entries')
      .upsert(
        { entry_date: date, census, extras },
        { onConflict: 'entry_date' }
      )
    setSaving(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      await loadEntries()
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('extra_help_entries').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const metrics = useMemo(() => {
    const daysLogged = entries.length
    let apCount = 0
    let docCount = 0
    let daysWithExtra = 0
    entries.forEach((e) => {
      const ap = e.extras.filter((x) => x.type === 'AP').length
      const doc = e.extras.filter((x) => x.type === 'Doc').length
      apCount += ap
      docCount += doc
      if (ap + doc > 0) daysWithExtra++
    })
    const pct = daysLogged ? Math.round((daysWithExtra / daysLogged) * 100) : 0
    return { daysLogged, apCount, docCount, daysWithExtra, pct }
  }, [entries])

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-inksoft">Hospitalist coverage · since {TRACKING_START_DATE}</p>
            <h1 className="font-serif text-2xl text-ink">Extra help tracker</h1>
          </div>
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
              sublabel={`${metrics.daysWithExtra} of ${metrics.daysLogged} days`}
              accent={metrics.pct >= 50 ? 'text-alert' : undefined}
            />
            <MetricCard label="Extra AP instances" value={metrics.apCount} accent="text-teal-600" />
            <MetricCard label="Extra physician instances" value={metrics.docCount} accent="text-amber-600" />
          </div>
        </section>

        {errorMsg && (
          <p className="text-sm text-alert bg-white border border-line rounded-md px-3 py-2">{errorMsg}</p>
        )}

        <ExtraHelpChart entries={entries} />

        <div className="grid md:grid-cols-2 gap-6">
          <EntryForm onSave={handleSave} saving={saving} />
          <EntryLog entries={entries} onDelete={handleDelete} />
        </div>

        {loading && <p className="text-sm text-inksoft">Loading…</p>}
      </main>
    </div>
  )
}
