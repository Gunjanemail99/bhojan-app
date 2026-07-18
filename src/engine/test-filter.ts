import { filterMeals, Meal } from './filter'

const meals: Meal[] = [
  { id: '1', code: 'D001', name: 'Moong-Paneer Chapati', slot: 'D', effort: 'moderate', freq_days: 7, is_vegetarian: true, needs_soak: true },
  { id: '2', code: 'D005', name: 'Khichdi + Curd', slot: 'D', effort: 'quick', freq_days: 7, is_vegetarian: true, needs_soak: false },
  { id: '3', code: 'D010', name: 'Palak Paneer', slot: 'D', effort: 'moderate', freq_days: 7, is_vegetarian: true, needs_soak: false },
  { id: '4', code: 'B012', name: 'Poha', slot: 'B', effort: 'quick', freq_days: 10, is_vegetarian: true, needs_soak: false },
]

const result = filterMeals(meals, {
  slot: 'D',
  daysSinceServed: { '3': 1 },        // Palak Paneer was 1 day ago
  alreadyThisWeek: ['2'],             // Khichdi already used
  soakPossible: false,                // it's evening — no soaking now
})

console.log('ELIGIBLE:', result.eligible.map((m) => m.name))
console.log('REJECTED:')
result.rejected.forEach((r) => console.log('  -', r.meal.name, '→', r.reason))
