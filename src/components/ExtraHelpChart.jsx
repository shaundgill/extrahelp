import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { weekKey, weekLabel, monthKey, monthLabel, formatDateLabel } from '../lib/dateUtils'

const GRANULARITIES = ['Week', 'Month', 'Day']

function groupEntries(entries, granularity) {
  if (granularity === 'Day') {
    return entries.map((e) => ({
      key: e.date,
      label: formatDateLabel(e.date),
      ap: e.extras.filter((x) => x.type === 'AP').length,
      doc: e.extras.filter((x) => x.type === 'Doc').length,
      avgCensus: e.census ?? null,
    }))
  }
  const keyFn = granularity === 'Week' ? weekKey : monthKey
  const labelFn = granularity === 'Week' ? weekLabel : monthLabel
  const groups = new Map()
  entries.forEach((e) => {
    const k = keyFn(e.date)
    if (!groups.has(k)) {
      groups.set(k, { key: k, label: labelFn(e.date), ap: 0, doc: 0, censusSum: 0, censusN: 0 })
    }
    const g = groups.get(k)
    g.ap += e.extras.filter((x) => x.type === 'AP').length
    g.doc += e.extras.filter((x) => x.type === 'Doc').length
    if (e.census != null) {
      g.censusSum += e.census
      g.censusN += 1
    }
  })
  return Array.from(groups.values())
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .map((g) => ({
      key: g.key,
      label: g.label,
      ap: g.ap,
      doc: g.doc,
      avgCensus: g.censusN ? Math.round(g.censusSum / g.censusN) : null,
    }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const ap = payload.find((p) => p.dataKey === 'ap')?.value || 0
  const doc = payload.find((p) => p.dataKey === 'doc')?.value || 0
  const census = payload.find((p) => p.dataKey === 'avgCensus')?.value
  return (
    <div className="bg-white border border-line rounded-md px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-ink mb-1">{label}</p>
      <p className="text-teal-600">Extra AP: {ap}</p>
      <p className="text-amber-600">Extra physician: {doc}</p>
      {census != null && <p className="text-inksoft">Avg census: {census}</p>}
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
  const hasCensus = data.some((d) => d.avgCensus != null)

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
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
      <p className="text-xs text-inksoft mb-3">
        {granularity === 'Week' && 'Extra help sent per week, against average daily census that week.'}
        {granularity === 'Month' && 'Extra help sent per month, against average daily census that month.'}
        {granularity === 'Day' && 'Extra help sent per day, against that day\'s census.'}
      </p>

      <div className="flex gap-4 mb-3 text-xs text-inksoft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" /> Extra AP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" /> Extra physician
        </span>
        {hasCensus && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-ink inline-block" /> Avg census
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#E1E0D9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#525B66' }} axisLine={{ stroke: '#DCD9CF' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#525B66' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Extra help', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#525B66' }}
            />
            {hasCensus && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 11, fill: '#525B66' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Census', angle: 90, position: 'insideRight', fontSize: 11, fill: '#525B66' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F5F1' }} />
            <Bar yAxisId="left" dataKey="ap" stackId="a" fill="#1F7A6C" maxBarSize={40} />
            <Bar yAxisId="left" dataKey="doc" stackId="a" fill="#C17F1E" radius={[3, 3, 0, 0]} maxBarSize={40} />
            {hasCensus && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgCensus"
                stroke="#1B2430"
                strokeWidth={2}
                dot={{ r: 3, fill: '#1B2430' }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
