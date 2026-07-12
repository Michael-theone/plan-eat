export type Meal = {
  name: string;
  tag: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const MEALS: Meal[] = [
  { name: "Greek Yogurt Bowl", tag: "Breakfast", calories: 320, protein: 28, carbs: 34, fat: 9 },
  { name: "Veggie Omelette", tag: "Breakfast", calories: 380, protein: 24, carbs: 10, fat: 26 },
  { name: "Oats & Berries", tag: "Breakfast", calories: 410, protein: 14, carbs: 68, fat: 9 },
  { name: "Grilled Chicken Salad", tag: "Lunch", calories: 480, protein: 42, carbs: 28, fat: 20 },
  { name: "Salmon & Quinoa Bowl", tag: "Lunch", calories: 560, protein: 38, carbs: 45, fat: 22 },
  { name: "Turkey Wrap", tag: "Lunch", calories: 420, protein: 30, carbs: 40, fat: 14 },
  { name: "Stir-Fry Tofu & Rice", tag: "Dinner", calories: 520, protein: 26, carbs: 60, fat: 16 },
  { name: "Baked Cod & Veggies", tag: "Dinner", calories: 390, protein: 36, carbs: 20, fat: 16 },
  { name: "Beef & Sweet Potato", tag: "Dinner", calories: 610, protein: 40, carbs: 48, fat: 26 },
  { name: "Protein Smoothie", tag: "Snack", calories: 220, protein: 20, carbs: 24, fat: 5 },
  { name: "Almonds & Apple", tag: "Snack", calories: 260, protein: 6, carbs: 28, fat: 15 },
];

export const MEAL_SPLIT: Record<Meal["tag"], number> = {
  Breakfast: 0.25,
  Lunch: 0.35,
  Dinner: 0.3,
  Snack: 0.1,
};

export const TAG_COLOR: Record<Meal["tag"], string> = {
  Breakfast: "#F2B705",
  Lunch: "#6B8E4E",
  Dinner: "#E4572E",
  Snack: "#8C8577",
};

export function pickMeals(dailyCalories: number) {
  return (Object.keys(MEAL_SPLIT) as Meal["tag"][]).map((tag) => {
    const slotTarget = dailyCalories * MEAL_SPLIT[tag];
    const options = MEALS.filter((m) => m.tag === tag);
    const best = options.reduce((closest, m) =>
      Math.abs(m.calories - slotTarget) < Math.abs(closest.calories - slotTarget) ? m : closest
    );
    return best;
  });
}

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export type Profile = {
  age: number;
  heightCm: number;
  sex: Sex;
  activity: ActivityLevel;
  goal: Goal;
};

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const DEFAULT_PROFILE: Profile = {
  age: 25,
  heightCm: 170,
  sex: "male",
  activity: "moderate",
  goal: "maintain",
};

// Mifflin-St Jeor equation — the standard formula nutrition apps use to
// estimate calorie needs from weight, height, age, sex, and activity.
export function calcTargets(weightKg: number, profile: Profile) {
  const bmr =
    profile.sex === "male"
      ? 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;

  let calories = bmr * ACTIVITY_MULTIPLIER[profile.activity];
  if (profile.goal === "lose") calories -= 500;
  if (profile.goal === "gain") calories += 500;
  calories = Math.max(1200, Math.round(calories));

  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}

export type ScanResult = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  confidence: string;
};

export type FoodLogEntry = ScanResult & {
  id: string;
  image: string | null;
  timestamp: number;
  source: "scan" | "manual";
};

export type WeightEntry = {
  date: string;
  weightKg: number;
};