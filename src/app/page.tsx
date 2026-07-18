import { supabase } from '@/lib/supabase'

import RateMeal from '@/components/RateMeal'

export default async function Home() {
  const { data: members } = await supabase.from('members').select('*').order('name')
  const { data: meals } = await supabase.from('meals').select('*').order('code')
  const { data: rules } = await supabase.from('rules').select('*').order('code')

  const bySlot = (slot: string) => meals?.filter((m) => m.slot === slot) ?? []
  const slotNames: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Bhojan</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Household Food Operating System</p>

      <section style={{ marginTop: 28 }}>
        <h2>Household ({members?.length ?? 0})</h2>
        {members?.map((m) => (
          <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong>{m.name}</strong>{' '}
            <span style={{ color: '#666', fontSize: 14 }}>
              {m.life_stage} · {m.is_vegetarian ? 'vegetarian' : 'non-veg'}
              {m.is_vegetarian && (m.eats_egg ? ' · eats egg' : ' · no egg')}
              {' · '}portion ×{m.portion_factor}
            </span>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Meal Library ({meals?.length ?? 0})</h2>
        {['B', 'L', 'D'].map((slot) => (
          <div key={slot} style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 6 }}>
              {slotNames[slot]} ({bySlot(slot).length})
            </h3>
            {bySlot(slot).map((m) => (
              <div key={m.id} style={{ padding: '5px 0', fontSize: 14, borderBottom: '1px solid #f4f4f4' }}>
                <span style={{ color: '#999', fontSize: 12 }}>{m.code}</span>{' '}
                {m.name}{' '}
                <span style={{ color: '#888', fontSize: 12 }}>
                  · {m.effort} · every {m.freq_days}d · {m.calories} kcal, {m.protein}g protein
                  {m.needs_soak && ' · ⏳ soak'}
                </span>
                <RateMeal mealId={m.id} members={members ?? []} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <section style={{ marginTop: 28, marginBottom: 40 }}>
        <h2>House Rules ({rules?.length ?? 0})</h2>
        {rules?.map((r) => (
          <div key={r.id} style={{ padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f4f4f4' }}>
            <span style={{ color: '#999', fontSize: 12 }}>{r.code}</span> {r.description}{' '}
            <span style={{ color: r.is_hard ? '#c0392b' : '#888', fontSize: 12 }}>
              ({r.is_hard ? 'hard' : 'soft'})
            </span>
          </div>
        ))}
      </section>
    </main>
  )
}