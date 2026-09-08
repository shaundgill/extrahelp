import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts'

const NORMAL = '#2E6F86'
const ELEVATED = '#D9A441'
const HIGH = '#B4392E'

function tierFor(value, low, high) {
  if (value >= high) return HIGH
  if (value >= low) return ELEVATED
  return NORMAL
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const census = payload[0]?.value
  return (
    <div className="bg-white border border-line rounded-md px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-ink mb-1">{label}</p>
      <p className="text-ink">Avg census: {census}</p>
    </div>
  )
}

export default function CensusChart({ data }) {
  const withCensus = useMemo(() => data.filter((d) => d.census != null), [data])

  const { low, high } = useMemo(() => {
    if (withCensus.length === 0) return { low: 0, high: 0 }
    const values = withCensus.map((d) => d.census)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    return { low: min + range * 0.33, high: min + range * 0.66 }
  }, [withCensus])

  if (withCensus.length === 0) {
    return (
      <div className="bg-white border border-line rounded-lg p-5">
        <h2 className="font-serif text-lg text-ink mb-1">Census</h2>
        <p className="text-sm text-inksoft">No census logged yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <h2 className="font-serif text-lg text-ink mb-1">Census</h2>
      <p className="text-xs text-inksoft mb-3">Average daily census for the period — color shows how it stacks up against your own recent range.</p>

      <div className="flex gap-4 mb-3 text-xs text-inksoft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: NORMAL }} /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: ELEVATED }} /> Elevated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: HIGH }} /> High
        </span>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={withCensus} margin={{ top: 20, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#E1E0D9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#525B66' }} axisLine={{ stroke: '#DCD9CF' }} tickLine={false} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#525B66' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F5F1' }} />
            <Bar dataKey="census" radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList dataKey="census" position="top" style={{ fontSize: 11, fill: '#525B66' }} />
              {withCensus.map((d, i) => (
                <Cell key={i} fill={tierFor(d.census, low, high)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
