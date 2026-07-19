const SLOTS = [
  { code: 'B', label: 'Breakfast', time: '8 am' },
  { code: 'T', label: 'Tiffin', time: 'school' },
  { code: 'L', label: 'Lunch', time: '1 pm' },
  { code: 'S', label: 'Snack', time: '4 pm' },
  { code: 'D', label: 'Dinner', time: '8 pm' },
]

export default function Today({
  entries, today, tomorrow,
}: { entries: any[]; today: string; tomorrow: string }) {
  const todays = entries.filter((e) => e.entry_date === today)
  const tomorrows = entries.filter((e) => e.entry_date === tomorrow)

  const itemName = (e: any) =>
    e.meals?.name ?? e.tiffin_items?.name ?? e.snacks?.name ?? '—'

  // anything tomorrow that needs soaking = a job for tonight
  const soakTasks = tomorrows.filter((e) => e.meals?.needs_soak)

  if (todays.length === 0) {
    return <p style={{ color: '#888' }}>Nothing planned for today.</p>
  }

  return (
    <div>
      {soakTasks.length > 0 && (
        <div style={{ background: '#FDF6E7', border: '1px solid #F0D9A3', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#B87A0A', marginBottom: 4 }}>⏳ DO TONIGHT</div>
          {soakTasks.map((e) => (
            <div key={e.slot} style={{ fontSize: 14 }}>
              Soak for <strong>{e.meals.name}</strong> (tomorrow&apos;s {SLOTS.find((s) => s.code === e.slot)?.label.toLowerCase()})
            </div>
          ))}
        </div>
      )}

      {SLOTS.map((s) => {
        const e = todays.find((x) => x.slot === s.code)
        if (!e) return null
        const cooked = e.status === 'cooked'
        return (
          <div key={s.code} style={{
            border: '1px solid #e6e6e6', borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            opacity: cooked ? 0.55 : 1,
          }}>
            <div style={{ fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: '.05em' }}>
              {s.label.toUpperCase()} · {s.time}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, margin: '2px 0 4px' }}>
              {itemName(e)}
              {e.fruits?.name && <span style={{ color: '#2e7d32', fontWeight: 400 }}> + {e.fruits.name}</span>}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {e.meals?.effort && <>{e.meals.effort}</>}
              {e.meals?.needs_soak && <> · ⏳ needed soaking</>}
              {cooked && <span style={{ color: '#2e7d32', fontWeight: 600 }}> · ✓ cooked</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}