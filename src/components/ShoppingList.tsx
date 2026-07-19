import ShopItem from './ShopItem'

export default function ShoppingList({
  entries, householdId, weekStart, savedStatus,
}: {
  entries: any[]; householdId: string; weekStart: string; savedStatus: Record<string, string>
}) {
  const map: Record<string, string[]> = {}

  for (const e of entries) {
    const sources = [e.meals, e.tiffin_items, e.snacks, e.fruits].filter(Boolean)
    for (const src of sources) {
      for (const item of (src.shop_items ?? [])) {
        const key = String(item).toLowerCase()
        if (!map[key]) map[key] = []
        const reason = `${String(src.name).split('+')[0].trim()} (${e.entry_date.slice(5)})`
        if (!map[key].includes(reason)) map[key].push(reason)
      }
    }
  }

  const all = Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  if (all.length === 0) return <p style={{ color: '#888' }}>No plan to shop for.</p>

  const pending = all.filter(([i]) => (savedStatus[i] ?? 'pending') === 'pending')
  const basket  = all.filter(([i]) => savedStatus[i] === 'need')
  const have    = all.filter(([i]) => savedStatus[i] === 'have')

  const section = (title: string, colour: string, rows: [string, string[]][]) =>
    rows.length === 0 ? null : (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colour, marginBottom: 4 }}>{title}</div>
        {rows.map(([item, reasons]) => (
          <ShopItem
            key={item}
            item={item}
            reasons={reasons}
            householdId={householdId}
            weekStart={weekStart}
            initialStatus={savedStatus[item] ?? 'pending'}
          />
        ))}
      </div>
    )

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        {pending.length} to sort · {basket.length} in basket · {have.length} already here
      </p>
      {section('TO SORT — have it or need it?', '#555', pending)}
      {section('🧺 BASKET', '#B87A0A', basket)}
      {section('ALREADY IN THE KITCHEN', '#2e7d32', have)}
    </div>
  )
}