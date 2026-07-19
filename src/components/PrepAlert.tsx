export default function PrepAlert({ tasks }: { tasks: { name: string; forDate: string; slot: string }[] }) {
  if (tasks.length === 0) return null
  return (
    <div style={{
      background: '#FFF4E5', border: '2px solid #E8A317', borderRadius: 10,
      padding: '14px 16px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#B87A0A', letterSpacing: '.06em', marginBottom: 6 }}>
        ⏳ DO TONIGHT — TIME SENSITIVE
      </div>
      {tasks.map((t, i) => (
        <div key={i} style={{ fontSize: 15, fontWeight: 600, padding: '2px 0' }}>
          Soak for {t.name} <span style={{ fontWeight: 400, color: '#666', fontSize: 13 }}>— needed {t.forDate}</span>
        </div>
      ))}
    </div>
  )
}