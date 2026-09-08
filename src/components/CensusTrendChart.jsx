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
} from 'recharts'
import { formatDateLabel } from '../lib/dateUtils'

// A cool-to-hot gradient across the chart's own date range, so the color
// itself reads left-to-right as "earlier -> more recent" regardless of the
// specific census numbers.
const COOL = [46, 111, 134] // #2E6F86
const HOT = [180, 57, 46] // #B4392E

function lerpColor(t) {
  const r = Math.round(COOL[0] + (HOT[0] - COOL[0]) * t)
  const g = Math.round(COOL[1] + (HOT[1] - COOL[1]) * t)
  const b = Math.round(COOL[2] + (HOT[2] - COOL[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white border border-line rounded-md px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-ink mb-1">{label}</p>
      <p className="text-ink">Census: {payload[0].value}</p>
    </div>
  )
}

export default function CensusTrendChart({ entries }) {
  const data = useMemo(
    () =>
      [...entries]
        .filter((e) => e.census != null)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((e) => ({ key: e.date, label: formatDateLabel(e.date), census: e.census })),
    [entries]
  )

  const trend = useMemo(() => {
    if (data.length < 4) return null
    const third = Math.max(1, Math.floor(data.length / 3))
    const early = data.slice(0, third)
    const recent = data.slice(-third)
    const avg = (arr) => arr.reduce((s, d) => s + d.census, 0) / arr.length
    const diff = Math.round(avg(recent) - avg(early))
    return diff
  }, [data])

  if (data.length === 0) {
    return (
      <div className="bg-white border border-line rounded-lg p-5">
        <h2 className="font-serif text-lg text-ink mb-1">Census trend</h2>
        <p className="text-sm text-inksoft">No census logged yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-serif text-lg text-ink">Census trend</h2>
        {trend != null && (
          <span
            className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
              trend > 0 ? 'bg-amber-50 text-amber-800' : trend < 0 ? 'bg-teal-50 text-teal-800' : 'bg-paper text-inksoft'
            }`}
          >
            {trend > 0 ? `↑ up ${trend} since tracking began` : trend < 0 ? `↓ down ${Math.abs(trend)} since tracking began` : 'holding steady'}
          </span>
        )}
      </div>
      <p className="text-xs text-inksoft mb-4">Every logged day's census, oldest to most recent — color deepens as it gets more recent.</p>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#E1E0D9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#525B66' }} axisLine={{ stroke: '#DCD9CF' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#525B66' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F5F1' }} />
            <Bar dataKey="census" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill={lerpColor(data.length > 1 ? i / (data.length - 1) : 0)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
