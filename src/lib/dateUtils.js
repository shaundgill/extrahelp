export function formatDateLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateLong(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// ISO week key, e.g. "2026-W28"
export function weekKey(iso) {
  const d = new Date(iso + 'T00:00:00')
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = (target - firstThursday) / 86400000
  const week = 1 + Math.round((diff - ((firstThursday.getDay() + 6) % 7)) / 7)
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function weekLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  const dayNr = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayNr)
  return 'Wk of ' + monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function monthKey(iso) {
  return iso.slice(0, 7)
}

export function monthLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
