export default function MetricCard({ label, value, sublabel, accent }) {
  return (
    <div className="bg-white border border-line rounded-lg p-4">
      <p className="text-xs text-inksoft mb-1">{label}</p>
      <p className={`text-2xl font-serif ${accent || 'text-ink'}`}>{value}</p>
      {sublabel && <p className="text-xs text-inksoft mt-1">{sublabel}</p>}
    </div>
  )
}
