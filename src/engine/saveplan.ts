import { PlannedSlot } from './fillWeek'

export async function savePlan(
  supabase: any,
  householdId: string,
  weekStart: string,
  plan: PlannedSlot[]
) {
  // 1. Remove any existing plan for this week (so re-running is safe)
  await supabase.from('plans').delete().eq('household_id', householdId).eq('week_start', weekStart)

  // 2. Create the plan row
  const { data: planRow, error: planErr } = await supabase
    .from('plans')
    .insert({ household_id: householdId, week_start: weekStart, status: 'draft' })
    .select()
    .single()

  if (planErr) throw new Error('Could not create plan: ' + planErr.message)

  // 3. Build the entry rows
  const fruitByDate: Record<string, string> = {}
  for (const p of plan) {
    if (p.slot === 'F' && p.meal) fruitByDate[p.date] = p.meal.id
  }

  const rows = plan
    .filter((p) => p.slot !== 'F' && p.meal)     // fruit rides on breakfast
    .map((p) => ({
      plan_id: planRow.id,
      entry_date: p.date,
      slot: p.slot,
      meal_id: ['B', 'L', 'D'].includes(p.slot) ? p.meal.id : null,
      tiffin_id: p.slot === 'T' ? p.meal.id : null,
      snack_id: p.slot === 'S' ? p.meal.id : null,
      fruit_id: p.slot === 'B' ? fruitByDate[p.date] ?? null : null,
      status: 'planned',
    }))

  const { error: entryErr } = await supabase.from('plan_entries').insert(rows)
  if (entryErr) throw new Error('Could not save entries: ' + entryErr.message)

  return { planId: planRow.id, entryCount: rows.length }
}