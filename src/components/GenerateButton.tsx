'use client'

import { useState } from 'react'
import { generateWeek } from '@/app/actions'

export default function GenerateButton() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function run() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await generateWeek()
      setMsg(`Planned week of ${res.weekStart} — ${res.entryCount} entries`)
    } catch (e: any) {
      setMsg('Error: ' + e.message)
    }
    setBusy(false)
  }

  return (
    <span style={{ marginLeft: 12 }}>
      <button
        onClick={run}
        disabled={busy}
        style={{ padding: '6px 12px', cursor: busy ? 'wait' : 'pointer', borderRadius: 6, border: '1px solid #333', background: busy ? '#eee' : '#fff', fontSize: 13 }}
      >
        {busy ? 'Planning…' : '✨ Generate Next Week'}
      </button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: msg.startsWith('Error') ? 'red' : 'green' }}>{msg}</span>}
    </span>
  )
}