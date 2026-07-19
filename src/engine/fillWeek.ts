import { filterMeals, Meal } from './filter'
import { scoreMeals } from './score'
import { pickSnack, pickTiffin, pickFruit, SimpleItem } from './pickers'

type FullMeal = Meal & {
  calories: number; protein: number; carbs: number; fat: number; fiber: number
}

export type WeekInput = {
  meals: FullMeal[]
  weekStart: string
  daysSinceServed: Record<string, number>
  avgRating: Record<string, number>
  dailyTargets: number[]
  tiffin: SimpleItem[]
  snacks: SimpleItem[]
  fruits: SimpleItem[]
  planningFrom?: string      // defaults to today
}

export type PlannedSlot = {
  date: string
  slot: string
  meal: any
  score: number
  why: [string, number][]
  rejectedCount: number
}

const todayIso = () => new Date().toISOString().slice(0, 10)

// A soak-requiring meal is only feasible if the evening BEFORE it
// is still in the future at the moment of planning.
function canSoakFor(mealDate: string, planningFrom: string): boolean {
  return addDays(mealDate, -1) >= planningFrom
}

const addDays = (iso: string, n: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function addNutrition(totals: number[], item: any, factor: number) {
  totals[0] += (item.calories ?? 0) * factor
  totals[1] += (item.protein ?? 0) * factor
  totals[2] += (item.carbs ?? 0) * factor
  totals[3] += (item.fat ?? 0) * factor
  totals[4] += (item.fiber ?? 0) * factor
}

export function fillWeek(input: WeekInput): PlannedSlot[] {
  const plan: PlannedSlot[] = []
  const usedThisWeek: string[] = []
  const recentTiffin: string[] = []
  const recentSnacks: string[] = []
  const nutrition = [0, 0, 0, 0, 0]
  let elaborateUsed = 0

  const weeklyTargets = input.dailyTargets.map((t) => t * 7)

  for (let d = 0; d < 7; d++) {
    const date = addDays(input.weekStart, d)
    const dow = new Date(date).getDay()
    const isWeekend = dow === 0 || dow === 6

    for (const slot of ['B', 'L', 'D']) {
      const { eligible, rejected } = filterMeals(input.meals, {
        slot,
        daysSinceServed: input.daysSinceServed,
        alreadyThisWeek: usedThisWeek,
        soakPossible: canSoakFor(date, input.planningFrom ?? todayIso()),
      })

if (slot === 'B' && date === input.weekStart) {
        const soakOk = canSoakFor(date, input.planningFrom ?? todayIso())
        const soakMeals = input.meals.filter((m: any) => m.slot === 'B' && m.needs_soak)
        
      }

      if (eligible.length === 0) {
        plan.push({ date, slot, meal: null, score: 0, why: [], rejectedCount: rejected.length })
        continue
      }

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
        meal: winner.meal,
        score: winner.score,
        why: winner.breakdown,
        rejectedCount: rejected.length,
      })

      usedThisWeek.push(winner.meal.id)
      addNutrition(nutrition, winner.meal, 1)
      if ((winner.meal as FullMeal).effort === 'elaborate') elaborateUsed++
    }

    // --- non-meal slots: tiffin (school days), snack, fruit ---
    const prevDinner = plan.find((p) => p.date === addDays(date, -1) && p.slot === 'D')?.meal?.name ?? null

    const tif = pickTiffin(input.tiffin, date, recentTiffin, prevDinner)
    if (tif) {
      recentTiffin.push(tif.id)
      plan.push({ date, slot: 'T', meal: tif, score: 0, why: [['tiffin rotation', 0]], rejectedCount: 0 })
      addNutrition(nutrition, tif, 0.5)
    }

    const sn = pickSnack(input.snacks, date, recentSnacks)
    if (sn) {
      recentSnacks.push(sn.id)
      plan.push({ date, slot: 'S', meal: sn, score: 0, why: [['snack rotation', 0]], rejectedCount: 0 })
      addNutrition(nutrition, sn, 0.5)
    }

    const fr = pickFruit(input.fruits, date)
    if (fr) {
      plan.push({ date, slot: 'F', meal: fr, score: 0, why: [['daily fruit', 0]], rejectedCount: 0 })
      addNutrition(nutrition, fr, 1)
    }
  }
// meals needing a soak the evening before the plan even starts
  const preWeekSoaks = plan.filter(
    (p) => p.meal?.needs_soak && addDays(p.date, -1) < input.weekStart
  )
  ;(plan as any).preWeekSoaks = preWeekSoaks
  return plan
}

export function nutritionSummary(plan: PlannedSlot[], dailyTargets: number[]) {
  const totals = [0, 0, 0, 0, 0]
  for (const p of plan) {
    if (!p.meal) continue
    const factor = p.slot === 'T' || p.slot === 'S' ? 0.5 : 1
    addNutrition(totals, p.meal, factor)
  }
  const names = ['kcal', 'protein', 'carbs', 'fat', 'fiber']
  return names.map((n, i) => ({
    name: n,
    total: Math.round(totals[i]),
    target: dailyTargets[i] * 7,
    pct: Math.round((totals[i] / (dailyTargets[i] * 7)) * 100),
  }))
}