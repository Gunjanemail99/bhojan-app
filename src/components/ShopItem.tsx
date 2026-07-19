'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ShopItem({
  item, reasons, householdId, weekStart, initialStatus,
}: {
  item: string; reasons: string[]; householdId: string; weekStart: string; initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [busy, setBusy] = useState(false)

  async function set(next: string) {
    setBusy(true)
    const prev = status
    setStatus(next)                                  // update the screen immediately

    await supabase.from('shopping_status').upsert(
      { household_id: householdId, week_start: weekStart, item, status: next },
      { onConflict: 'household_id,week_start,item' }
    )

    // learning: remember how often this item is already in the kitchen
    if (next !== prev) {
      const { data: stat } = await supabase
        .from('pantry_stats').select('*')
        .eq('household_id', householdId).eq('item', item).maybeSingle()

      await supabase.from('pantry_stats').upsert({
        household_id: householdId,
        item,
        have_count: (stat?.have_count ?? 0) + (next === 'have' ? 1 : 0),
        need_count: (stat?.need_count ?? 0) + (next === 'need' ? 1 : 0),
      }, { onConflict: 'household_id,item' })
    }
    setBusy(false)
  }

  const btn = (label: string, value: string, colour: string) => (
    <button
      onClick={() => set(value)}
      disabled={busy}
      style={{
        marginLeft: 6, padding: '4px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
        border: '1px solid ' + (status === value ? colour : '#ddd'),
        background: status === value ? colour : '#fff',
        color: status === value ? '#fff' : '#555',
      }}
    >{label}</button>
  )

  return (
    <div style={{ padding: '7px 0', borderBottom: '1px solid #f4f4f4', display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600, textTransform: 'capitalize', opacity: status === 'have' ? 0.45 : 1 }}>{item}</span>
        {reasons.length > 1 && <span style={{ marginLeft: 6, fontSize: 11, color: '#888' }}>×{reasons.length}</span>}
        <div style={{ fontSize: 11, color: '#999' }}>{reasons.slice(0, 2).join(' · ')}</div>
      </div>
      {btn('Have', 'have', '#2e7d32')}
      {btn('Need', 'need', '#B87A0A')}
    </div>
  )
}