import type { FoodLogEntry } from "./nutrition";

export function dateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dailyTotals(log: FoodLogEntry[]) {
  const map = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
  for (const entry of log) {
    const key = dateKey(entry.timestamp);
    const existing = map.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    existing.calories += entry.calories;
    existing.protein += entry.protein;
    existing.carbs += entry.carbs;
    existing.fat += entry.fat;
    map.set(key, existing);
  }
  return map;
}

// A day "counts" toward a streak if you logged something and landed within
// 20% of your calorie target — a simple rule, not a precise measure.
export function calcStreak(log: FoodLogEntry[], calorieTarget: number) {
  const totals = dailyTotals(log);
  const lower = calorieTarget * 0.8;
  const upper = calorieTarget * 1.2;

  let current = 0;
  const cursor = new Date();
  if (!totals.has(dateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const day = totals.get(dateKey(cursor.getTime()));
    if (day && day.calories >= lower && day.calories <= upper) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  let longest = current;
  const sortedKeys = [...totals.keys()].sort();
  let run = 0;
  let prevKey: string | null = null;
  for (const key of sortedKeys) {
    const day = totals.get(key)!;
    const hit = day.calories >= lower && day.calories <= upper;
    if (!hit) {
      run = 0;
      prevKey = key;
      continue;
    }
    if (prevKey) {
      const diffDays = Math.round((new Date(key).getTime() - new Date(prevKey).getTime()) / 86400000);
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prevKey = key;
  }

  return { current, longest };
}

export type WeeklyDay = {
  date: string;
  calories: number;
  protein: number;
  hitTarget: boolean;
};

export function calcWeeklySummary(log: FoodLogEntry[], calorieTarget: number) {
  const totals = dailyTotals(log);
  const lower = calorieTarget * 0.8;
  const upper = calorieTarget * 1.2;

  const days: WeeklyDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d.getTime());
    const t = totals.get(key);
    const calories = t?.calories ?? 0;
    days.push({
      date: key,
      calories,
      protein: t?.protein ?? 0,
      hitTarget: calories > 0 && calories >= lower && calories <= upper,
    });
  }

  const logged = days.filter((d) => d.calories > 0);
  const avgCalories = logged.length ? Math.round(logged.reduce((s, d) => s + d.calories, 0) / logged.length) : 0;
  const avgProtein = logged.length ? Math.round(logged.reduce((s, d) => s + d.protein, 0) / logged.length) : 0;
  const daysHit = days.filter((d) => d.hitTarget).length;

  return { days, avgCalories, avgProtein, daysHit };
}