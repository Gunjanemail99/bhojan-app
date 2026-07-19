const PARAMS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', colour: '#E8A317' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    colour: '#3E7C4F' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    colour: '#8A6FB8' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    colour: '#C7402D' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',    colour: '#33565E' },
]

const DAILY_TARGETS: Record<string, number> = {
  calories: 2000, protein: 60, carbs: 250, fat: 65, fiber: 30,
}

export default function Insights({ entries }: { entries: any[] }) {
  if (entries.length === 0) return <p style={{ color: '#888' }}>No plan to analyse.</p>

  // --- nutrition totals across the week ---
  const totals: Record<string, number> = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  for (const e of entries) {
    const src = e.meals ?? e.tiffin_items ?? e.snacks ?? null
    const factor = e.slot === 'T' || e.slot === 'S' ? 0.5 : 1   // child/partial portions
    if (src) for (const p of PARAMS) totals[p.key] += (src[p.key] ?? 0) * factor
    if (e.fruits) for (const p of PARAMS) totals[p.key] += (e.fruits[p.key] ?? 0)
  }

  const days = new Set(entries.map((e) => e.entry_date)).size || 7

  // --- variety: how many distinct meals out of all main slots ---
  const mainMeals = entries.filter((e) => ['B', 'L', 'D'].includes(e.slot) && e.meals)
  const distinct = new Set(mainMeals.map((e) => e.meals.name)).size
  const variety = mainMeals.length ? distinct / mainMeals.length : 0

  // --- effort: elaborate meals used against a cap of 2 ---
  const elaborate = mainMeals.filter((e) => e.meals.effort === 'elaborate').length
  const effort = elaborate <= 2 ? 1 : Math.max(0, 1 - (elaborate - 2) * 0.25)

  // --- nutrition score: average coverage, capped at 100% each ---
  const coverage = PARAMS.map((p) => Math.min(1, totals[p.key] / (DAILY_TARGETS[p.key] * days)))
  const nutrition = coverage.reduce((a, b) => a + b, 0) / PARAMS.length

  // weighted household score (budget & satisfaction deferred)
  const score = Math.round((nutrition * 0.55 + variety * 0.30 + effort * 0.15) * 100)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#33565E' }}>{score}</span>
        <span style={{ fontSize: 13, color: '#666' }}>household score · {days} days planned</span>
      </div>

      {PARAMS.map((p, i) => {
        const pct = Math.round((totals[p.key] / (DAILY_TARGETS[p.key] * days)) * 100)
        return (
          <div key={p.key} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
              <span style={{ fontWeight: 600, color: p.colour }}>{p.label}</span>
              <span style={{ color: '#666' }}>
                {Math.round(totals[p.key])} / {DAILY_TARGETS[p.key] * days} {p.unit} ({pct}%)
              </span>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: Math.min(100, pct) + '%', height: '100%', background: p.colour }} />
            </div>
          </div>
        )
      })}

      <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>
        <div>Variety: {distinct} distinct meals out of {mainMeals.length} ({Math.round(variety * 100)}%)</div>
        <div>Effort: {elaborate} elaborate meal{elaborate === 1 ? '' : 's'} (cap 2)</div>
      </div>
    </div>
  )
}