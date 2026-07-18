import { filterMeals, Meal } from './filter'
import { scoreMeals } from './score'

type FullMeal = Meal & {
  calories: number; protein: number; carbs: number; fat: number; fiber: number
}

export type WeekInput = {
  meals: FullMeal[]
  weekStart: string                        // 'YYYY-MM-DD' (a Monday)
  daysSinceServed: Record<string, number>  // history before this week
  avgRating: Record<string, number>
  dailyTargets: number[]                   // [kcal, protein, carbs, fat, fiber] per day
}

export type PlannedSlot = {
  date: string
  slot: string
  meal: FullMeal | null
  score: number
  why: [string, number][]
  rejectedCount: number
}

const addDays = (iso: string, n: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function fillWeek(input: WeekInput): PlannedSlot[] {
  const plan: PlannedSlot[] = []
  const usedThisWeek: string[] = []
  const nutrition = [0, 0, 0, 0, 0]
  let elaborateUsed = 0

  const weeklyTargets = input.dailyTargets.map((t) => t * 7)

  for (let d = 0; d < 7; d++) {
    const date = addDays(input.weekStart, d)
    const dow = new Date(date).getDay()          // 0 = Sunday, 6 = Saturday
    const isWeekend = dow === 0 || dow === 6

    for (const slot of ['B', 'L', 'D']) {
      // Stage 1: what's allowed?
      const { eligible, rejected } = filterMeals(input.meals, {
        slot,
        daysSinceServed: input.daysSinceServed,
        alreadyThisWeek: usedThisWeek,
        soakPossible: true,                       // planning ahead, so soaking is fine
      })

      if (eligible.length === 0) {
        plan.push({ date, slot, meal: null, score: 0, why: [], rejectedCount: rejected.length })
        continue
      }

      // Stage 2: what's best?
      const ranked = scoreMeals(eligible as FullMeal[], {
        daysSinceServed: input.daysSinceServed,
        avgRating: input.avgRating,
        weekNutrition: nutrition,
        weeklyTargets,
        elaborateUsed,
        isWeekend,
      })

      const winner = ranked[0]
      plan.push({
        date, slot,
        meal: winner.meal as FullMeal,
        score: winner.score,
        why: winner.breakdown,
        rejectedCount: rejected.length,
      })

      // --- update the context so the next choice knows about this one ---
      usedThisWeek.push(winner.meal.id)
      const m = winner.meal as FullMeal
      nutrition[0] += m.calories; nutrition[1] += m.protein; nutrition[2] += m.carbs
      nutrition[3] += m.fat;      nutrition[4] += m.fiber
      if (m.effort === 'elaborate') elaborateUsed++
    }
  }

  return plan
}

export function nutritionSummary(plan: PlannedSlot[], dailyTargets: number[]) {
  const totals = [0, 0, 0, 0, 0]
  for (const p of plan) {
    if (!p.meal) continue
    totals[0] += p.meal.calories; totals[1] += p.meal.protein; totals[2] += p.meal.carbs
    totals[3] += p.meal.fat;      totals[4] += p.meal.fiber
  }
  const names = ['kcal', 'protein', 'carbs', 'fat', 'fiber']
  return names.map((n, i) => ({
    name: n,
    total: Math.round(totals[i]),
    target: dailyTargets[i] * 7,
    pct: Math.round((totals[i] / (dailyTargets[i] * 7)) * 100),
  }))
}