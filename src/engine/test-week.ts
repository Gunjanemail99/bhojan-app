import { createClient } from '@supabase/supabase-js'
import { fillWeek, nutritionSummary } from './fillWeek'
import * as fs from 'fs'
import { savePlan } from './savePlan'

// read .env.local manually since this runs outside Next.js
const env = fs.readFileSync('.env.local', 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)![1].trim()
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)![1].trim()
const supabase = createClient(url, key)

async function main() {
  const { data: meals } = await supabase.from('meals').select('*')
  const { data: ratings } = await supabase.from('meal_ratings').select('meal_id, rating')
  const { data: tiffin } = await supabase.from('tiffin_items').select('*')
  const { data: snacks } = await supabase.from('snacks').select('*')
  const { data: fruits } = await supabase.from('fruits').select('*')

  const avgRating: Record<string, number> = {}
  const counts: Record<string, number> = {}
  for (const r of ratings ?? []) {
    counts[r.meal_id] = (counts[r.meal_id] ?? 0) + 1
    avgRating[r.meal_id] = ((avgRating[r.meal_id] ?? 0) * (counts[r.meal_id] - 1) + r.rating) / counts[r.meal_id]
  }

  const plan = fillWeek({
    meals: meals as any,
    weekStart: '2026-07-27',
    daysSinceServed: {},
    avgRating,
    dailyTargets: [2000, 60, 250, 65, 30],
    tiffin: (tiffin ?? []) as any,
    snacks: (snacks ?? []) as any,
    fruits: (fruits ?? []) as any,
  })

  let currentDate = ''
  for (const p of plan) {
    if (p.date !== currentDate) { console.log(`\n${p.date}`); currentDate = p.date }
    console.log(`  ${p.slot}: ${p.meal?.name ?? '(nothing eligible)'}  [${p.score}]`)
  }

  console.log('\nWEEK NUTRITION vs TARGET:')
  nutritionSummary(plan, [2000, 60, 250, 65, 30]).forEach((n) =>
    console.log(`  ${n.name}: ${n.total} / ${n.target} (${n.pct}%)`)
  )
  const { data: household } = await supabase.from('households').select('id').limit(1).single()
  const saved = await savePlan(supabase, household.id, '2026-07-27', plan)
  console.log(`\nSAVED: plan ${saved.planId} with ${saved.entryCount} entries`)
}

main()