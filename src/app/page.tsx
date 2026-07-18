import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: meals, error } = await supabase.from('meals').select('*')

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Bhojan — My Meals</h1>

      {error && (
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      )}

      {meals && meals.length === 0 && (
        <p>No meals found. (The table might be blocked — that's expected.)</p>
      )}

      <ul>
        {meals?.map((meal) => (
          <li key={meal.id}>
            {meal.name} — {meal.effort}
          </li>
        ))}
      </ul>
    </main>
  )
}