// Earliest date the tracker accepts entries for.
export const TRACKING_START_DATE = '2026-07-01'

// Baseline staffing model, shown as context on the dashboard.
export const BASELINE = {
  roundingDocs: 5,
  roundingDocsSweetSpot: 16,
  admittingDocs: 1,
  coreAPs: 2,
}

export const CORE_APS = ['Vila', 'Gallagher', 'Horn', 'Piger']

export const FLOAT_AP_NAMES = [
  'Julia Shapiro',
  'Hannah',
  'Ahn Tran',
  'Patrick Newins',
  'Ian Prator',
  'Jacqueline Gavin',
  'Nicole Misko',
  'Lynn Seagreaves',
  'Amanda Peri',
  'Ann Reiter',
  'Shawn Owens',
  'Other / unnamed',
]

// APs have a known float pool to pick from. Extra physicians don't have a
// fixed roster (no more "Physician 6" placeholder) — just type the name.
export const DOC_EXTRA_NAMES = ['Other / unnamed']
