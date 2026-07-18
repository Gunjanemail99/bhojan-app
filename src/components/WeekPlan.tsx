const SLOTS = [
  { code: 'B', label: 'Breakfast' },
  { code: 'T', label: 'Tiffin' },
  { code: 'L', label: 'Lunch' },
  { code: 'S', label: 'Snack' },
  { code: 'D', label: 'Dinner' },
]

export default function WeekPlan({ plan, entries }: { plan: any; entries: any[] }) {
  if (!plan) return <p style={{ color: '#888' }}>No plan yet.</p>

  const days = [...new Set(entries.map((e) => e.entry_date))].sort()
  const itemFor = (e: any) =>
    e.meals?.name ?? e.tiffin_items?.name ?? e.snacks?.name ?? '—'

  return (
    <div>
      <p style={{ color: '#666', fontSize: 13, marginTop: 0 }}>
        Week of {plan.week_start} · {plan.status}
      </p>

      {days.map((day) => (
        <div key={day} style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 6, fontSize: 15 }}>
            {new Date(day).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </h3>
          {SLOTS.map((s) => {
            const e = entries.find((x) => x.entry_date === day && x.slot === s.code)
            if (!e) return null
            return (
              <div key={s.code} style={{ display: 'flex', gap: 10, padding: '4px 0', fontSize: 14, borderBottom: '1px solid #f4f4f4' }}>
                <span style={{ width: 80, color: '#888', fontSize: 12 }}>{s.label}</span>
                <span>
                  {itemFor(e)}
                  {e.fruits?.name && <span style={{ color: '#2e7d32' }}> + {e.fruits.name}</span>}
                  {e.meals?.effort && <span style={{ color: '#999', fontSize: 12 }}> · {e.meals.effort}</span>}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}