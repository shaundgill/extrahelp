import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { weekKey, weekLabel, monthKey, monthLabel, formatDateLabel } from '../lib/dateUtils'

const GRANULARITIES = ['Day', 'Week', 'Month']

function groupEntries(entries, granularity) {
  if (granularity === 'Day') {
    return entries.map((e) => ({
      key: e.date,
      label: formatDateLabel(e.date),
      ap: e.extras.filter((x) => x.type === 'AP').length,
      doc: e.extras.filter((x) => x.type === 'Doc').length,
    }))
  }
  const keyFn = granularity === 'Week' ? weekKey : monthKey
  const labelFn = granularity === 'Week' ? weekLabel : monthLabel
  const groups = new Map()
  entries.forEach((e) => {
    const k = keyFn(e.date)
    if (!groups.has(k)) {
      groups.set(k, { key: k, label: labelFn(e.date), ap: 0, doc: 0 })
    }
    const g = groups.get(k)
    g.ap += e.extras.filter((x) => x.type === 'AP').length
    g.doc += e.extras.filter((x) => x.type === 'Doc').length
  })
  return Array.from(groups.values()).sort((a, b) => (a.key < b.key ? -1 : 1))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const ap = payload.find((p) => p.dataKey === 'ap')?.value || 0
  const doc = payload.find((p) => p.dataKey === 'doc')?.value || 0
  return (
    <div className="bg-white border border-line rounded-md px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-ink mb-1">{label}</p>
      <p className="text-teal-600">Extra AP: {ap}</p>
      <p className="text-amber-600">Extra physician: {doc}</p>
    </div>
  )
}

export default function ExtraHelpChart({ entries }) {
  const [granularity, setGranularity] = useState('Week')
  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [entries]
  )
  const data = useMemo(() => groupEntries(sorted, granularity), [sorted, granularity])

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg text-ink">Extra help over time</h2>
        <div className="flex border border-line rounded-md overflow-hidden text-xs">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 ${
                granularity === g ? 'bg-ink text-white' : 'bg-white text-inksoft hover:bg-paper'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-3 text-xs text-inksoft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" /> Extra AP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" /> Extra physician
        </span>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#E1E0D9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#525B66' }} axisLine={{ stroke: '#DCD9CF' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#525B66' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F5F1' }} />
            <Bar dataKey="ap" stackId="a" fill="#1F7A6C" radius={[0, 0, 0, 0]} maxBarSize={36} />
            <Bar dataKey="doc" stackId="a" fill="#C17F1E" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
