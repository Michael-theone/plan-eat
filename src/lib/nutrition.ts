export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface Profile {
  age: number;
  heightCm: number;
  sex: Sex;
  goal: Goal;
  activityLevel: ActivityLevel;
}

export const DEFAULT_PROFILE: Profile = {
  age: 28,
  heightCm: 175,
  sex: "male",
  goal: "maintain",
  activityLevel: "moderate",
};

export interface ScanResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  sugar: number;
  fat: number;
  confidence: string;
}

export interface FoodLogEntry extends ScanResult {
  id: string;
  image: string | null;
  timestamp: number;
  source: "scan" | "manual";
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface Meal {
  tag: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const TAG_COLOR: Record<string, string> = {
  breakfast: "#FFB627",
  lunch: "#FF5A5F",
  dinner: "#8BC34A",
  snack: "#251A14",
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calcTargets(weightKg: number, profile: Profile) {
  const { age, heightCm, sex, goal, activityLevel } = profile;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  let tdee = bmr * (ACTIVITY_MULTIPLIER[activityLevel] ?? 1.375);
  if (goal === "lose") tdee -= 500;
  if (goal === "gain") tdee += 400;
  const calories = Math.max(1200, Math.round(tdee / 10) * 10);

  const proteinPerKg = goal === "lose" ? 2.0 : goal === "gain" ? 1.8 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}

export function getDaySeed() {
  return Math.floor(Date.now() / 86400000);
}

const MEAL_POOL: Meal[] = [
  { tag: "breakfast", name: "Veggie Omelette", calories: 380, protein: 24, carbs: 10, fat: 26 },
  { tag: "breakfast", name: "Greek Yogurt & Berry Bowl", calories: 320, protein: 22, carbs: 38, fat: 8 },
  { tag: "breakfast", name: "Oats with Peanut Butter", calories: 410, protein: 18, carbs: 52, fat: 14 },
  { tag: "breakfast", name: "Smoked Salmon Bagel", calories: 440, protein: 26, carbs: 46, fat: 16 },

  { tag: "lunch", name: "Grilled Chicken Salad", calories: 480, protein: 42, carbs: 28, fat: 20 },
  { tag: "lunch", name: "Turkey & Avocado Wrap", calories: 460, protein: 32, carbs: 40, fat: 18 },
  { tag: "lunch", name: "Quinoa Buddha Bowl", calories: 500, protein: 22, carbs: 58, fat: 16 },
  { tag: "lunch", name: "Tuna Poke Bowl", calories: 470, protein: 34, carbs: 46, fat: 14 },

  { tag: "dinner", name: "Stir-Fry Tofu & Rice", calories: 520, protein: 26, carbs: 60, fat: 16 },
  { tag: "dinner", name: "Baked Salmon & Greens", calories: 540, protein: 38, carbs: 22, fat: 28 },
  { tag: "dinner", name: "Lean Beef & Sweet Potato", calories: 560, protein: 40, carbs: 44, fat: 20 },
  { tag: "dinner", name: "Chicken Fajita Bowl", calories: 510, protein: 36, carbs: 42, fat: 18 },

  { tag: "snack", name: "Protein Smoothie", calories: 220, protein: 20, carbs: 24, fat: 5 },
  { tag: "snack", name: "Almonds & Apple", calories: 210, protein: 6, carbs: 24, fat: 12 },
  { tag: "snack", name: "Cottage Cheese & Pineapple", calories: 180, protein: 18, carbs: 18, fat: 4 },
  { tag: "snack", name: "Protein Bar", calories: 200, protein: 20, carbs: 20, fat: 6 },
];

export function pickMeals(_calories: number, seed: number): Meal[] {
  const tags: Meal["tag"][] = ["breakfast", "lunch", "dinner", "snack"];
  return tags.map((tag, i) => {
    const pool = MEAL_POOL.filter((m) => m.tag === tag);
    const idx = (seed + i * 7) % pool.length;
    return pool[idx];
  });
}