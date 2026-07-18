import { scoreMeals } from './score'

const meals: any[] = [
  { id: '1', code: 'D005', name: 'Khichdi + Curd',   slot: 'D', effort: 'quick',     freq_days: 7,  is_vegetarian: true, needs_soak: false, calories: 420, protein: 14, carbs: 68, fat: 8,  fiber: 8 },
  { id: '2', code: 'D010', name: 'Palak Paneer',     slot: 'D', effort: 'moderate',  freq_days: 7,  is_vegetarian: true, needs_soak: false, calories: 560, protein: 22, carbs: 60, fat: 24, fiber: 8 },
  { id: '3', code: 'D015', name: 'Paneer Cashew Methi', slot: 'D', effort: 'elaborate', freq_days: 10, is_vegetarian: true, needs_soak: false, calories: 580, protein: 22, carbs: 50, fat: 30, fiber: 7 },
]

const result = scoreMeals(meals, {
  daysSinceServed: { '1': 3, '2': 14 },        // Khichdi recent, Palak long ago
  avgRating: { '1': 2.5, '2': 4.5 },           // family dislikes Khichdi, loves Palak
  weekNutrition: [8000, 200, 900, 250, 90],    // where the week stands
  weeklyTargets: [14000, 420, 1750, 455, 210], // 7 days x daily targets
  elaborateUsed: 1,
  isWeekend: false,
})

result.forEach((r, i) => {
  console.log(`${i + 1}. ${r.meal.name} — ${r.score}`)
  r.breakdown.forEach(([why, pts]) => console.log(`     ${pts > 0 ? '+' : ''}${pts}  ${why}`))
})