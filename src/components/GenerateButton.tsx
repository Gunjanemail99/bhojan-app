'use client'

import { useState } from 'react'
import { generateWeek } from '@/app/actions'

export default function GenerateButton() {
  const [busy, setBusy] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function run(offset: number) {
    setBusy(offset)
    setMsg(null)
    try {
      const res = await generateWeek(offset)
      setMsg(`Planned week of ${res.weekStart} — ${res.entryCount} entries`)
    } catch (e: any) {
      setMsg('Error: ' + e.message)
    }
    setBusy(null)
  }

  const btn = (label: string, offset: number) => (
    <button
      onClick={() => run(offset)}
      disabled={busy !== null}
      style={{
        marginLeft: 8, padding: '6px 12px', fontSize: 13, borderRadius: 6,
        cursor: busy !== null ? 'wait' : 'pointer',
        border: '1px solid #333', background: busy === offset ? '#eee' : '#fff',
      }}
    >
      {busy === offset ? 'Planning…' : label}
    </button>
  )

  return (
    <span>
      {btn('Plan this week', 0)}
      {btn('Plan next week', 1)}
      {msg && (
        <div style={{ marginTop: 6, fontSize: 12, color: msg.startsWith('Error') ? 'red' : 'green' }}>
          {msg}
        </div>
      )}
    </span>
  )
}