'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MarkCooked({ entryId, cooked }: { entryId: string; cooked: boolean }) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function toggle() {
    setBusy(true)
    const { error } = await supabase
      .from('plan_entries')
      .update({ status: cooked ? 'planned' : 'cooked' })
      .eq('id', entryId)
    setBusy(false)
    if (error) { alert('Error: ' + error.message); return }
    router.refresh()          // re-fetch the server data so the page updates
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        marginTop: 6, padding: '5px 11px', fontSize: 12, borderRadius: 6,
        cursor: busy ? 'wait' : 'pointer',
        border: '1px solid ' + (cooked ? '#2e7d32' : '#ccc'),
        background: cooked ? '#EDF3EE' : '#fff',
        color: cooked ? '#2e7d32' : '#333',
      }}
    >
      {busy ? '…' : cooked ? '✓ Cooked' : 'Mark cooked'}
    </button>
  )
}