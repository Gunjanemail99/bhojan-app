import { Meal } from './filter'

export type ScoreContext = {
  daysSinceServed: Record<string, number>
  avgRating: Record<string, number>      // meal id -> average rating (1-5)
  weekNutrition: number[]                // running totals [kcal, protein, carbs, fat, fiber]
  weeklyTargets: number[]                // targets for the week
  elaborateUsed: number                  // how many elaborate meals already this week
  isWeekend: boolean
}

export type ScoredMeal = {
  meal: Meal
  score: number
  breakdown: [string, number][]          // [reason, points] — the "why"
}

export function scoreMeals(
  meals: (Meal & { calories: number; protein: number; carbs: number; fat: number; fiber: number })[],
  ctx: ScoreContext
): ScoredMeal[] {
  const scored = meals.map((meal) => {
    const breakdown: [string, number][] = []
    let score = 0

    // 1. VARIETY — the longer since we had it, the better (capped at 2x its cycle)
    const days = ctx.daysSinceServed[meal.id] ?? 999
    const variety = Math.min(2, days / meal.freq_days) * 20
    score += variety
    breakdown.push([`variety (${days > 90 ? 'not recently' : days + 'd ago'})`, round(variety)])

    // 2. PREFERENCE — family ratings, centred on 3 (neutral)
    const rating = ctx.avgRating[meal.id]
    if (rating !== undefined) {
      const pref = (rating - 3) * 8
      score += pref
      breakdown.push([`family rating ${rating.toFixed(1)}/5`, round(pref)])
    }

    // 3. NUTRITION GAP — reward meals that fill what the week is short on
    const nutrients = [meal.calories, meal.protein, meal.carbs, meal.fat, meal.fiber]
    let gapPoints = 0
    for (let i = 0; i < 5; i++) {
      const deficit = Math.max(0, ctx.weeklyTargets[i] - ctx.weekNutrition[i])
      if (deficit > 0) gapPoints += (Math.min(nutrients[i], deficit) / ctx.weeklyTargets[i]) * 30
    }
    score += gapPoints
    breakdown.push(['fills nutrition gaps', round(gapPoints)])

    // 4. EFFORT — quick is a small bonus; elaborate costs, and is capped at 2/week
    if (meal.effort === 'quick') { score += 3; breakdown.push(['quick to make', 3]) }
    if (meal.effort === 'elaborate') {
      if (ctx.elaborateUsed >= 2) { score -= 100; breakdown.push(['elaborate cap reached', -100]) }
      else if (!ctx.isWeekend) { score -= 6; breakdown.push(['elaborate on a weekday', -6]) }
    }

    // 5. WEEKEND — a little room for something special
    if (ctx.isWeekend && meal.effort !== 'quick') { score += 4; breakdown.push(['weekend', 4]) }

    return { meal, score: round(score), breakdown }
  })

  return scored.sort((a, b) => b.score - a.score)
}

function round(n: number) { return Math.round(n * 10) / 10 }