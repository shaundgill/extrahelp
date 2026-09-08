import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function CompositionDonut({ apCount, docCount }) {
  const total = apCount + docCount
  if (total === 0) {
    return (
      <div className="bg-white border border-line rounded-lg p-5">
        <h2 className="font-serif text-lg text-ink mb-1">Extra help mix</h2>
        <p className="text-sm text-inksoft">No extra help logged yet.</p>
      </div>
    )
  }

  const data = [
    { name: 'Extra AP', value: apCount, color: '#1F7A6C' },
    { name: 'Extra physician', value: docCount, color: '#C17F1E' },
  ].filter((d) => d.value > 0)

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <h2 className="font-serif text-lg text-ink mb-1">Extra help mix</h2>
      <p className="text-xs text-inksoft mb-3">Share of extra-help instances, AP vs. physician, since tracking began.</p>
      <div className="flex items-center gap-6">
        <div style={{ width: 140, height: 140 }} className="shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: d.color }} />
              <span className="text-ink">{d.name}</span>
              <span className="text-inksoft">
                {d.value} ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
          ))}
          <p className="text-xs text-inksoft pt-1">{total} total instances</p>
        </div>
      </div>
    </div>
  )
}
