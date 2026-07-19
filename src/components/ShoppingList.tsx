export default function ShoppingList({ entries }: { entries: any[] }) {
  const map: Record<string, string[]> = {}

  for (const e of entries) {
    const sources = [e.meals, e.tiffin_items, e.snacks, e.fruits].filter(Boolean)
    if (e.snacks) {
      console.log('SNACK ROW:', e.slot, e.entry_date, '| name:', e.snacks.name, '| shop_items:', JSON.stringify(e.snacks.shop_items))
    }
    for (const src of sources) {
      for (const item of (src.shop_items ?? [])) {
        const key = String(item).toLowerCase()
        if (!map[key]) map[key] = []
        const reason = `${String(src.name).split('+')[0].trim()} (${e.entry_date.slice(5)})`
        if (!map[key].includes(reason)) map[key].push(reason)
      }
    }
  }

  const list = Object.entries(map).sort((a, b) => b[1].length - a[1].length)

  if (list.length === 0) return <p style={{ color: '#888' }}>No plan to shop for.</p>

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        {list.length} items derived from this week&apos;s plan
      </p>
      {list.map(([item, reasons]) => (
        <div key={item} style={{ padding: '7px 0', borderBottom: '1px solid #f4f4f4', fontSize: 14 }}>
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item}</span>
          {reasons.length > 1 && (
            <span style={{ marginLeft: 6, fontSize: 11, background: '#eef1f1', padding: '1px 6px', borderRadius: 10, color: '#556' }}>
              ×{reasons.length}
            </span>
          )}
          <div style={{ fontSize: 11, color: '#999' }}>{reasons.slice(0, 3).join(' · ')}</div>
        </div>
      ))}
    </div>
  )
}