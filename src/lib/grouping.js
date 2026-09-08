import { weekKey, weekLabel, monthKey, monthLabel, formatDateLabel } from './dateUtils'

// Groups entries into day/week/month buckets with extra-help counts and
// average census for that bucket (null if no census was logged for it).
export function groupEntries(entries, granularity) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1))

  if (granularity === 'Day') {
    return sorted.map((e) => ({
      key: e.date,
      label: formatDateLabel(e.date),
      ap: e.extras.filter((x) => x.type === 'AP').length,
      doc: e.extras.filter((x) => x.type === 'Doc').length,
      census: e.census ?? null,
    }))
  }

  const keyFn = granularity === 'Week' ? weekKey : monthKey
  const labelFn = granularity === 'Week' ? weekLabel : monthLabel
  const groups = new Map()
  sorted.forEach((e) => {
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
      census: g.censusN ? Math.round(g.censusSum / g.censusN) : null,
    }))
}
