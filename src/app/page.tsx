import { supabase } from '@/lib/supabase'
import RateMeal from '@/components/RateMeal'
import WeekPlan from '@/components/WeekPlan'
import GenerateButton from '@/components/GenerateButton'
import Today from '@/components/Today'
import PrepAlert from '@/components/PrepAlert'
import ShoppingList from '@/components/ShoppingList'
import Insights from '@/components/Insights'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: members } = await supabase.from('members').select('*').order('name')
  const { data: meals } = await supabase.from('meals').select('*').order('code')
  const { data: rules } = await supabase.from('rules').select('*').order('code')
  const { data: ratings } = await supabase.from('meal_ratings').select('meal_id, rating')

  const summary: Record<string, { avg: number; count: number }> = {}
  for (const r of ratings ?? []) {
    const s = summary[r.meal_id] ?? { avg: 0, count: 0 }
    const total = s.avg * s.count + r.rating
    s.count += 1
    s.avg = total / s.count
    summary[r.meal_id] = s
  }

  const today = new Date().toISOString().slice(0, 10)

   // the week we're currently in (started on or before today)
  const { data: currentPlan } = await supabase
    .from('plans').select('*')
    .lte('week_start', today)
    .order('week_start', { ascending: false })
    .limit(1).maybeSingle()

  // otherwise, the soonest upcoming week
  const { data: upcomingPlan } = await supabase
    .from('plans').select('*')
    .gt('week_start', today)
    .order('week_start', { ascending: true })
    .limit(1).maybeSingle()

  const plan = currentPlan ?? upcomingPlan

  const { data: planEntries } = plan
    ? await supabase
        .from('plan_entries')
        .select('id, entry_date, slot, status, meals(name, effort, needs_soak, shop_items, calories, protein, carbs, fat, fiber), tiffin_items(name, shop_items, calories, protein, carbs, fat, fiber), snacks(name, shop_items, calories, protein, carbs, fat, fiber), fruits(name, shop_items, calories, protein, carbs, fat, fiber)')
        .eq('plan_id', plan.id)
    : { data: [] }

    const { data: householdRow } = await supabase.from('households').select('id').limit(1).maybeSingle()

  const { data: statusRows } = plan
    ? await supabase.from('shopping_status').select('item, status').eq('week_start', plan.week_start)
    : { data: [] }

  const savedStatus: Record<string, string> = {}
  for (const r of statusRows ?? []) savedStatus[r.item] = r.status

  const bySlot = (slot: string) => meals?.filter((m) => m.slot === slot) ?? []
  const slotNames: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 760, margin: '0 auto' }}>
      <PrepAlert
        tasks={(planEntries ?? [])
          .filter((e: any) => e.meals?.needs_soak && e.entry_date === new Date(Date.now() + 86400000).toISOString().slice(0, 10))
          .map((e: any) => ({ name: e.meals.name, forDate: e.entry_date, slot: e.slot }))}
      />
      <h1 style={{ marginBottom: 4 }}>Bhojan</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Household Food Operating System</p>

      <section style={{ marginTop: 28 }}>
        <h2>Today</h2>
        <Today
          entries={planEntries ?? []}
          today="2026-07-20"
          tomorrow="2026-07-21"
        />
      </section>



      <section style={{ marginTop: 28 }}>
        <h2 style={{ display: 'inline' }}>This Week</h2>
        <GenerateButton />
              </section>
  <section style={{ marginTop: 28 }}>
        <h2>Shopping List</h2>
        <ShoppingList
          entries={planEntries ?? []}
          householdId={householdRow?.id ?? ''}
          weekStart={plan?.week_start ?? ''}
          savedStatus={savedStatus}
        />
      </section>
      
<section style={{ marginTop: 28 }}>
        <h2>Insights</h2>
        <Insights entries={planEntries ?? []} />
      </section>

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
                {summary[m.id] && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#b8860b', fontWeight: 600 }}>
                    ⭐ {summary[m.id].avg.toFixed(1)} ({summary[m.id].count})
                  </span>
                )}
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