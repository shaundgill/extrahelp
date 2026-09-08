import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

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

export default function ExtraHelpChart({ data }) {
  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <h2 className="font-serif text-lg text-ink mb-1">Extra help sent</h2>
      <p className="text-xs text-inksoft mb-3">How many extra APs vs. physicians were called in.</p>

      <div className="flex gap-4 mb-3 text-xs text-inksoft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" /> Extra AP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" /> Extra physician
        </span>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#E1E0D9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#525B66' }} axisLine={{ stroke: '#DCD9CF' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#525B66' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F5F1' }} />
            <Bar dataKey="ap" stackId="a" fill="#1F7A6C" maxBarSize={40} />
            <Bar dataKey="doc" stackId="a" fill="#C17F1E" radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
