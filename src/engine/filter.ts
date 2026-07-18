// Stage 1 of the recommendation engine: eligibility filtering.
// Answers: "which meals could we have in this slot on this day?"

export type Meal = {
  id: string
  code: string
  name: string
  slot: string
  effort: string
  freq_days: number
  is_vegetarian: boolean
  needs_soak: boolean
}

export type FilterContext = {
  slot: string                       // 'B' | 'L' | 'D'
  daysSinceServed: Record<string, number>  // meal id -> days since last served
  alreadyThisWeek: string[]          // meal ids already used in this plan
  soakPossible: boolean              // was there an evening before to soak?
}

export type Rejected = { meal: Meal; reason: string }

export function filterMeals(
  meals: Meal[],
  ctx: FilterContext
): { eligible: Meal[]; rejected: Rejected[] } {
  const eligible: Meal[] = []
  const rejected: Rejected[] = []

  for (const meal of meals) {
    // 1. Wrong slot — a dinner can't be breakfast
    if (meal.slot !== ctx.slot) continue   // silently skip, not a "rejection"

    // 2. Already planned this week — no repeats
    if (ctx.alreadyThisWeek.includes(meal.id)) {
      rejected.push({ meal, reason: 'already planned this week' })
      continue
    }

    // 3. Too soon since last served (cooldown = 40% of its frequency, min 2 days)
    const days = ctx.daysSinceServed[meal.id] ?? 999
    const cooldown = Math.max(2, Math.floor(meal.freq_days * 0.4))
    if (days < cooldown) {
      rejected.push({ meal, reason: `had ${days}d ago, rests ${cooldown}d` })
      continue
    }

    // 4. Needs overnight soak but there was no chance to soak
    if (meal.needs_soak && !ctx.soakPossible) {
      rejected.push({ meal, reason: 'needs overnight soak — no time' })
      continue
    }

    eligible.push(meal)
  }

  return { eligible, rejected }
}