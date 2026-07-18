// Rotation pickers for tiffin, snacks and fruit — plus the household rules
// that override normal rotation (R10, R11, R12).

export type SimpleItem = {
  id: string; code: string; name: string
  calories: number; protein: number; carbs: number; fat: number; fiber: number
}

// R10: Monday & Wednesday snack is always Ragi Dosa
export function pickSnack(snacks: SimpleItem[], date: string, recent: string[]): SimpleItem | null {
  const dow = new Date(date).getDay()          // 1 = Mon, 3 = Wed
  if (dow === 1 || dow === 3) {
    const ragi = snacks.find((s) => /ragi/i.test(s.name))
    if (ragi) return ragi
  }
  const pool = snacks.filter((s) => !recent.slice(-2).includes(s.id))
  if (pool.length === 0) return snacks[0] ?? null
  return pool[dow % pool.length]
}

// R11: Chickpea Burger dinner -> Burger tiffin next day
// R12: Mix Veg Paratha dinner -> Mix Veg Paratha tiffin next day
export function pickTiffin(
  tiffin: SimpleItem[],
  date: string,
  recent: string[],
  previousDinnerName: string | null
): SimpleItem | null {
  const dow = new Date(date).getDay()
  if (dow === 0 || dow === 6) return null      // no school at weekends

  if (previousDinnerName) {
    if (/burger/i.test(previousDinnerName)) {
      const t = tiffin.find((x) => /burger/i.test(x.name))
      if (t) return t
    }
    if (/mix veg.*paratha/i.test(previousDinnerName)) {
      const t = tiffin.find((x) => /mix veg paratha/i.test(x.name))
      if (t) return t
    }
  }

  const pool = tiffin.filter((t) => !recent.slice(-2).includes(t.id))
  if (pool.length === 0) return tiffin[0] ?? null
  return pool[dow % pool.length]
}

// A rotating fruit with every breakfast
export function pickFruit(fruits: SimpleItem[], date: string): SimpleItem | null {
  if (fruits.length === 0) return null
  const d = new Date(date)
  return fruits[(d.getDate() + d.getDay()) % fruits.length]
}