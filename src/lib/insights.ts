import type { FoodLogEntry } from "./nutrition";

function dateKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function dailyTotals(foodLog: FoodLogEntry[]) {
  const map = new Map<string, { calories: number; protein: number }>();
  for (const e of foodLog) {
    const key = dateKey(e.timestamp);
    const cur = map.get(key) || { calories: 0, protein: 0 };
    cur.calories += e.calories;
    cur.protein += e.protein;
    map.set(key, cur);
  }
  return map;
}

function isHit(totalCalories: number, target: number) {
  if (target <= 0) return false;
  return Math.abs(totalCalories - target) <= target * 0.2;
}

export function calcStreak(foodLog: FoodLogEntry[], calorieTarget: number) {
  const totals = dailyTotals(foodLog);

  const cursor = new Date();
  const todayKey = cursor.toISOString().slice(0, 10);
  const todayDay = totals.get(todayKey);
  const todayHit = todayDay ? isHit(todayDay.calories, calorieTarget) : false;
  if (!todayHit) cursor.setDate(cursor.getDate() - 1);

  let current = 0;
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const day = totals.get(key);
    const hit = day ? isHit(day.calories, calorieTarget) : false;
    if (!hit) break;
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const keys = Array.from(totals.keys()).sort();
  let longest = 0;
  let run = 0;
  let prevDate: Date | null = null;
  for (const key of keys) {
    const day = totals.get(key)!;
    const hit = isHit(day.calories, calorieTarget);
    const d = new Date(key);
    if (hit) {
      if (prevDate) {
        const diffDays = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      longest = Math.max(longest, run);
      prevDate = d;
    } else {
      run = 0;
      prevDate = null;
    }
  }
  longest = Math.max(longest, current);

  return { current, longest };
}

export function calcWeeklySummary(foodLog: FoodLogEntry[], calorieTarget: number) {
  const totals = dailyTotals(foodLog);
  const days: { label: string; hit: boolean }[] = [];
  let sumCalories = 0;
  let sumProtein = 0;
  let daysHit = 0;
  let loggedDays = 0;

  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const day = totals.get(key);
    const label = cursor.toLocaleDateString([], { weekday: "short" });
    const hit = day ? isHit(day.calories, calorieTarget) : false;
    days.push({ label, hit });
    if (day) {
      sumCalories += day.calories;
      sumProtein += day.protein;
      loggedDays++;
    }
    if (hit) daysHit++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    days,
    avgCalories: loggedDays > 0 ? Math.round(sumCalories / loggedDays) : 0,
    avgProtein: loggedDays > 0 ? Math.round(sumProtein / loggedDays) : 0,
    daysHit,
  };
}