'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RateMeal({ mealId, members }: { mealId: string; members: any[] }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  async function rate(memberId: string, rating: number) {
    setSaving(true)
    const { error } = await supabase
      .from('meal_ratings')
      .insert({ meal_id: mealId, member_id: memberId, rating })
    setSaving(false)
    setSaved(error ? `Error: ${error.message}` : 'Saved ✓')
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <span style={{ marginLeft: 8, fontSize: 12 }}>
      {members.map((m) => (
        <span key={m.id} style={{ marginRight: 10 }}>
          <span style={{ color: '#666' }}>{m.name}:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => rate(m.id, n)}
              disabled={saving}
              style={{ marginLeft: 2, cursor: 'pointer', border: '1px solid #ddd', background: '#fff', borderRadius: 4 }}
            >
              {n}
            </button>
          ))}
        </span>
      ))}
      {saved && <span style={{ color: saved.startsWith('Error') ? 'red' : 'green' }}>{saved}</span>}
    </span>
  )
}