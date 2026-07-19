'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { fillWeek } from '@/engine/fillWeek'
import { savePlan } from '@/engine/savePlan'

function mondayOf(offsetWeeks: number): string {
  const d = new Date()
  const day = d.getDay()                      // 0 = Sun, 1 = Mon
  const offset = day === 0 ? -6 : 1 - day     // back up to this week's Monday
  d.setDate(d.getDate() + offset + offsetWeeks * 7)
  return d.toISOString().slice(0, 10)
}

export async function generateWeek(offsetWeeks: number = 0) {

  const [{ data: meals }, { data: ratings }, { data: tiffin }, { data: snacks }, { data: fruits }, { data: household }] =
    await Promise.all([
      supabase.from('meals').select('*'),
      supabase.from('meal_ratings').select('meal_id, rating'),
      supabase.from('tiffin_items').select('*'),
      supabase.from('snacks').select('*'),
      supabase.from('fruits').select('*'),
      supabase.from('households').select('id').limit(1).single(),
    ])

  // average rating per meal
  const avgRating: Record<string, number> = {}
  const counts: Record<string, number> = {}
  for (const r of ratings ?? []) {
    counts[r.meal_id] = (counts[r.meal_id] ?? 0) + 1
    avgRating[r.meal_id] =
      ((avgRating[r.meal_id] ?? 0) * (counts[r.meal_id] - 1) + r.rating) / counts[r.meal_id]
  }

  const weekStart = mondayOf(offsetWeeks)

  const plan = fillWeek({
    meals: (meals ?? []) as any,
    weekStart,
    daysSinceServed: {},
    avgRating,
    dailyTargets: [2000, 60, 250, 65, 30],
    tiffin: (tiffin ?? []) as any,
    snacks: (snacks ?? []) as any,
    fruits: (fruits ?? []) as any,
  })

  const saved = await savePlan(supabase, household!.id, weekStart, plan)

  revalidatePath('/')                          // tell the page to re-fetch
  return { weekStart, entryCount: saved.entryCount }
}