"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Unbounded, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { TAG_COLOR, pickMeals, calcTargets, DEFAULT_PROFILE, getDaySeed } from "@/lib/nutrition";
import type { Profile, ScanResult, FoodLogEntry, WeightEntry } from "@/lib/nutrition";
import { calcStreak, calcWeeklySummary } from "@/lib/insights";
import ProfileForm from "@/components/ProfileForm";
import WeightChart from "@/components/WeightChart";
import MealEditor from "@/components/MealEditor";
import StreakCard from "@/components/StreakCard";
import WeeklySummaryCard from "@/components/WeeklySummaryCard";
import TipJar from "@/components/TipJar";
import PlateRing from "@/components/PlateRing";
import FoodSearch from "@/components/FoodSearch";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800", "900"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

const CARD = "rounded-3xl border-[3px] border-[#251A14] bg-white shadow-[4px_4px_0_0_#251A14]";
const BTN_PRIMARY =
  "rounded-full border-[3px] border-[#251A14] bg-[#FF5A5F] px-7 py-3.5 text-sm font-bold text-[#251A14] shadow-[4px_4px_0_0_#251A14] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#251A14] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
const BTN_SECONDARY =
  "rounded-full border-[3px] border-[#251A14] bg-white px-6 py-3.5 text-sm font-bold text-[#251A14] shadow-[4px_4px_0_0_#251A14] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#251A14]";

function resizeImage(file: File, maxWidth = 600, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isToday(entry: FoodLogEntry) {
  const d = new Date(entry.timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);

  const [onboarded, setOnboarded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const formOpen = !onboarded || editingProfile;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [scanning, setScanning] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [manualMeal, setManualMeal] = useState<Omit<ScanResult, "confidence"> | null>(null);

  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<ScanResult, "confidence"> | null>(null);

  useEffect(() => {
    const savedWeight = localStorage.getItem("plate-weight");
    const savedUnit = localStorage.getItem("plate-unit");
    if (savedWeight) setWeight(Number(savedWeight));
    if (savedUnit === "kg" || savedUnit === "lb") setUnit(savedUnit);

    const savedProfile = localStorage.getItem("plate-profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {}
    }

    const savedOnboarded = localStorage.getItem("plate-onboarded");
    if (savedOnboarded === "true") setOnboarded(true);

    const savedHistory = localStorage.getItem("plate-weight-history");
    if (savedHistory) {
      try {
        setWeightHistory(JSON.parse(savedHistory));
      } catch {}
    }

    const savedLog = localStorage.getItem("plate-food-log");
    if (savedLog) {
      try {
        setFoodLog(JSON.parse(savedLog));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("plate-weight", String(weight));
    localStorage.setItem("plate-unit", unit);
  }, [weight, unit]);

  useEffect(() => {
    localStorage.setItem("plate-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("plate-onboarded", String(onboarded));
  }, [onboarded]);

  useEffect(() => {
    localStorage.setItem("plate-weight-history", JSON.stringify(weightHistory));
  }, [weightHistory]);

  useEffect(() => {
    localStorage.setItem("plate-food-log", JSON.stringify(foodLog));
  }, [foodLog]);

  const weightKg = unit === "kg" ? weight : weight * 0.453592;
  const { calories, protein, carbs, fat } = calcTargets(weightKg, profile);
  const recommended = pickMeals(calories, getDaySeed());
  const { current: streakCurrent, longest: streakLongest } = calcStreak(foodLog, calories);
  const weeklySummary = calcWeeklySummary(foodLog, calories);

  const todayEntries = foodLog.filter(isToday);
  const todayTotals = todayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  function logWeightToday() {
    const date = todayDateStr();
    setWeightHistory((prev) => {
      const idx = prev.findIndex((h) => h.date === date);
      const entry = { date, weightKg };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  function handleShowTargets() {
    logWeightToday();
    setOnboarded(true);
    setEditingProfile(false);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingMeal(null);
    setScanError(null);
    try {
      const resized = await resizeImage(file);
      setImagePreview(resized);
      setImageType("image/jpeg");
    } catch {
      setScanError("Couldn't read that photo, try another.");
    }
  }

  async function handleScan() {
    if (!imagePreview) return;
    setScanning(true);
    setScanError(null);
    try {
      const base64 = imagePreview.split(",")[1];
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: imageType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Scan failed");
      setPendingMeal(data);
    } catch {
      setScanError("Couldn't analyze that photo. Try a clearer shot.");
    } finally {
      setScanning(false);
    }
  }

  function confirmScan() {
    if (!pendingMeal) return;
    const entry: FoodLogEntry = {
      ...pendingMeal,
      id: crypto.randomUUID(),
      image: imagePreview,
      timestamp: Date.now(),
      source: "scan",
    };
    setFoodLog((prev) => [entry, ...prev]);
    setPendingMeal(null);
    setImagePreview(null);
  }

  function discardScan() {
    setPendingMeal(null);
    setImagePreview(null);
    setScanError(null);
  }

  function startManualEntry() {
    setManualMeal({ name: "", calories: 0, protein: 0, carbs: 0, fiber: 0, sugar: 0, fat: 0 });
  }

  function confirmManual() {
    if (!manualMeal || !manualMeal.name.trim()) return;
    const entry: FoodLogEntry = {
      ...manualMeal,
      confidence: "manual",
      id: crypto.randomUUID(),
      image: null,
      timestamp: Date.now(),
      source: "manual",
    };
    setFoodLog((prev) => [entry, ...prev]);
    setManualMeal(null);
  }

  function addSearchedFood(food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  }) {
    const entry: FoodLogEntry = {
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      confidence: "manual",
      id: crypto.randomUUID(),
      image: null,
      timestamp: Date.now(),
      source: "manual",
    };
    setFoodLog((prev) => [entry, ...prev]);
  }

  function startEdit(entry: FoodLogEntry) {
    setEditingId(entry.id);
    setEditDraft({
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fiber: entry.fiber,
      sugar: entry.sugar,
      fat: entry.fat,
    });
  }

  function saveEdit() {
    if (!editingId || !editDraft) return;
    setFoodLog((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...editDraft } : e)));
    setEditingId(null);
    setEditDraft(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  function deleteEntry(id: string) {
    setFoodLog((prev) => prev.filter((e) => e.id !== id));
  }

  const macroSegments = [
    { label: "Protein", value: protein * 4, color: "#FF5A5F" },
    { label: "Carbs", value: carbs * 4, color: "#FFB627" },
    { label: "Fat", value: fat * 9, color: "#8BC34A" },
  ];

  return (
    <div className={`${body.className} min-h-screen bg-[#FFF6E9] text-[#251A14]`}>
      <header className="px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className={`${display.className} text-xl font-extrabold tracking-tight`}>
            PLATE<span className="text-[#FF5A5F]">.</span>
          </span>
          {onboarded && (
            <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide sm:gap-6">
              <a href="#targets" className="hidden hover:text-[#FF5A5F] sm:inline">Targets</a>
              <a href="#picks" className="hidden hover:text-[#FF5A5F] sm:inline">Meals</a>
              <a href="#log" className="hidden hover:text-[#FF5A5F] sm:inline">Log</a>
              <button
                onClick={() => setEditingProfile(true)}
                className="rounded-full border-[3px] border-[#251A14] bg-white px-4 py-2 text-[11px] font-bold shadow-[3px_3px_0_0_#251A14] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#251A14]"
              >
                Edit details
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-16 pt-8 md:px-12">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #FFB627, transparent 70%)" }}
        />
        <div className="relative grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className={`${mono.className} text-xs font-semibold uppercase tracking-[0.2em] text-[#251A14]/50`}>
              Personal nutrition, not a generic chart
            </p>
            <h1 className={`${display.className} mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] md:text-6xl`}>
              Know exactly what&apos;s on your <span className="text-[#FF5A5F]">plate</span>.
            </h1>
            <p className="mt-5 max-w-md text-lg font-medium text-[#251A14]/70">
              Log your weight, scan a meal, and get targets built around your body — updated as you go.
            </p>
            {!onboarded && (
              <a href="#get-started" className={`${BTN_PRIMARY} mt-8 inline-block`}>
                Get started
              </a>
            )}
          </div>
          <div className="flex justify-center">
            <div className={`${CARD} p-8`}>
              <PlateRing
                segments={[
                  { label: "Protein", value: 30, color: "#FF5A5F" },
                  { label: "Carbs", value: 45, color: "#FFB627" },
                  { label: "Fat", value: 25, color: "#8BC34A" },
                ]}
                progress={0.62}
                centerValue="1,580"
                centerLabel="of 2,540 kcal"
              />
              <p className={`${mono.className} mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#251A14]/40`}>
                Example day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get started / edit profile */}
      <section id="get-started" className="mx-auto max-w-6xl px-6 md:px-12">
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            formOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className={`${CARD} mb-16 p-8 md:p-12`}>
            <h2 className={`${display.className} text-2xl font-extrabold`}>
              {onboarded ? "Update your details" : "Let's build your targets"}
            </h2>
            <p className="mt-1 text-sm font-medium text-[#251A14]/60">
              Takes about a minute — this drives every number below.
            </p>

            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#251A14]/60">Weight</span>
                <div className="mt-1 flex items-end gap-3">
                  <input
                    type="number"
                    min={0}
                    value={weight}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setWeight(Number(e.target.value) || 0)}
                    className={`${mono.className} w-32 rounded-2xl border-[3px] border-[#251A14] bg-white px-3 py-2 text-4xl font-bold text-[#251A14] outline-none`}
                  />
                  <div className="mb-1 flex gap-1">
                    {(["kg", "lb"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={`rounded-full border-[3px] border-[#251A14] px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                          unit === u ? "bg-[#251A14] text-[#FFF6E9]" : "bg-white text-[#251A14]"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ProfileForm profile={profile} onChange={setProfile} />
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={handleShowTargets} className={BTN_PRIMARY}>
                {onboarded ? "Save changes" : "Show my targets"}
              </button>
              {onboarded && (
                <button onClick={() => setEditingProfile(false)} className={BTN_SECONDARY}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <div
        className={`transition-all duration-500 ease-out ${
          formOpen ? "pointer-events-none max-h-0 overflow-hidden opacity-0" : "max-h-[20000px] opacity-100"
        }`}
      >
        <section id="targets" className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className={`${CARD} flex flex-col items-center justify-center p-8 text-center`}>
              <PlateRing
                segments={macroSegments}
                progress={calories > 0 ? todayTotals.calories / calories : 0}
                centerValue={String(todayTotals.calories)}
                centerLabel={`of ${calories} kcal`}
              />
              <div className="mt-6 flex gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FF5A5F]" /> Protein</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FFB627]" /> Carbs</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8BC34A]" /> Fat</span>
              </div>
            </div>

            <div className={`${CARD} p-8`}>
              <h2 className={`${display.className} text-xl font-extrabold`}>Today&apos;s progress</h2>
              <p className="mt-1 text-sm font-medium text-[#251A14]/50">
                {todayEntries.length === 0
                  ? "Nothing logged yet — scan or add a meal below to start tracking."
                  : `Based on ${todayEntries.length} meal${todayEntries.length === 1 ? "" : "s"} logged today.`}
              </p>
              <div className="mt-6 space-y-5">
                {[
                  { label: "Calories", value: todayTotals.calories, target: calories, color: "#251A14" },
                  { label: "Protein", value: todayTotals.protein, target: protein, color: "#FF5A5F" },
                  { label: "Carbs", value: todayTotals.carbs, target: carbs, color: "#FFB627" },
                  { label: "Fat", value: todayTotals.fat, target: fat, color: "#8BC34A" },
                ].map((m) => {
                  const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0;
                  return (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide">{m.label}</span>
                        <span className={`${mono.className} text-xs font-semibold text-[#251A14]/50`}>
                          {m.value} / {m.target}
                        </span>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full border-2 border-[#251A14] bg-white">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: m.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <div className="grid gap-6 md:grid-cols-2">
            <StreakCard current={streakCurrent} longest={streakLongest} />
            <WeeklySummaryCard
              days={weeklySummary.days}
              avgCalories={weeklySummary.avgCalories}
              avgProtein={weeklySummary.avgProtein}
              daysHit={weeklySummary.daysHit}
            />
          </div>
        </section>

        <section id="picks" className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <h2 className={`${display.className} text-xl font-extrabold`}>Today&apos;s picks</h2>
          <p className="mt-1 text-sm font-medium text-[#251A14]/50">Rotated daily, built around your {calories} kcal target.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {recommended.map((meal) => (
              <div key={meal.tag} className={`${CARD} p-5`}>
                <span
                  className="inline-block rounded-full border-2 border-[#251A14] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#251A14]"
                  style={{ backgroundColor: TAG_COLOR[meal.tag] === "#251A14" ? "#FFF6E9" : TAG_COLOR[meal.tag] }}
                >
                  {meal.tag}
                </span>
                <h3 className={`${display.className} mt-3 text-base font-bold leading-tight`}>{meal.name}</h3>
                <div className={`${mono.className} mt-3 space-y-1 text-xs font-medium text-[#251A14]/60`}>
                  <div className="flex justify-between"><span>Calories</span><span className="font-bold text-[#251A14]">{meal.calories}</span></div>
                  <div className="flex justify-between"><span>Protein</span><span>{meal.protein}g</span></div>
                  <div className="flex justify-between"><span>Carbs</span><span>{meal.carbs}g</span></div>
                  <div className="flex justify-between"><span>Fat</span><span>{meal.fat}g</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <h2 className={`${display.className} text-xl font-extrabold`}>Scan a meal</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border-[3px] border-dashed border-[#251A14] bg-white p-8 text-center">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Selected meal" className="mx-auto max-h-56 rounded-2xl border-[3px] border-[#251A14] object-cover" />
              ) : (
                <p className="text-sm font-semibold text-[#251A14]/50">Upload a photo of your meal</p>
              )}
              <label className={`${BTN_SECONDARY} mt-4 inline-block cursor-pointer text-xs uppercase tracking-wide`}>
                {imagePreview ? "Choose a different photo" : "Choose photo"}
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              </label>
              {imagePreview && !pendingMeal && (
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className={`${BTN_PRIMARY} mt-4 block w-full text-xs uppercase tracking-wide disabled:opacity-50`}
                >
                  {scanning ? "Analyzing..." : "Scan meal"}
                </button>
              )}
              {scanError && <p className="mt-3 text-xs font-semibold text-[#FF5A5F]">{scanError}</p>}
            </div>

            <div className={`${CARD} p-6`}>
              {pendingMeal ? (
                <>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#251A14]/50">
                    Review before logging · confidence: {pendingMeal.confidence}
                  </p>
                  <MealEditor value={pendingMeal} onChange={(v) => setPendingMeal({ ...pendingMeal, ...v })} />
                  <div className="mt-4 flex gap-2">
                    <button onClick={confirmScan} className={`${BTN_PRIMARY} flex-1 text-xs uppercase tracking-wide`}>
                      Log this meal
                    </button>
                    <button onClick={discardScan} className={`${BTN_SECONDARY} text-xs uppercase tracking-wide`}>
                      Discard
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-[#251A14]/50">
                  Your scan results will show up here for you to review before logging.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <h2 className={`${display.className} text-xl font-extrabold`}>Search a food</h2>
          <p className="mt-1 text-sm font-medium text-[#251A14]/50">
            Look up real nutrition data instead of typing it in by hand.
          </p>
          <div className="mt-6 max-w-md">
            <FoodSearch onAddFood={addSearchedFood} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <div className="flex items-center justify-between">
            <h2 className={`${display.className} text-xl font-extrabold`}>Add a meal manually</h2>
            {!manualMeal && (
              <button onClick={startManualEntry} className="text-xs font-bold uppercase tracking-wide text-[#251A14]/50 hover:text-[#FF5A5F]">
                + Add meal
              </button>
            )}
          </div>
          {manualMeal && (
            <div className={`${CARD} mt-6 max-w-md p-6`}>
              <MealEditor value={manualMeal} onChange={setManualMeal} />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={confirmManual}
                  disabled={!manualMeal.name.trim()}
                  className={`${BTN_PRIMARY} flex-1 text-xs uppercase tracking-wide disabled:opacity-50`}
                >
                  Add to log
                </button>
                <button onClick={() => setManualMeal(null)} className={`${BTN_SECONDARY} text-xs uppercase tracking-wide`}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="log" className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <div className="flex items-center justify-between">
            <h2 className={`${display.className} text-xl font-extrabold`}>Food log</h2>
            {foodLog.length > 0 && (
              <button onClick={() => setFoodLog([])} className="text-xs font-bold uppercase tracking-wide text-[#251A14]/50 hover:text-[#FF5A5F]">
                Clear all
              </button>
            )}
          </div>

          {foodLog.length === 0 ? (
            <p className="mt-6 text-sm font-medium text-[#251A14]/50">No meals logged yet — scan or add something above to get started.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {foodLog.map((entry) => (
                <div key={entry.id} className={`${CARD} overflow-hidden`}>
                  {entry.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.image} alt={entry.name} className="h-40 w-full border-b-[3px] border-[#251A14] object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center border-b-[3px] border-[#251A14] bg-[#FFF6E9] text-xs font-bold uppercase tracking-wide text-[#251A14]/40">
                      Manually logged
                    </div>
                  )}
                  <div className="p-4">
                    {editingId === entry.id && editDraft ? (
                      <>
                        <MealEditor value={editDraft} onChange={setEditDraft} />
                        <div className="mt-3 flex gap-2">
                          <button onClick={saveEdit} className={`${BTN_PRIMARY} flex-1 py-2 text-[10px] uppercase tracking-wide`}>
                            Save
                          </button>
                          <button onClick={cancelEdit} className={`${BTN_SECONDARY} py-2 text-[10px] uppercase tracking-wide`}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`${display.className} text-base font-bold leading-tight`}>{entry.name}</h3>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={() => startEdit(entry)} aria-label="Edit entry" className="text-[#251A14]/40 hover:text-[#FF5A5F]">✎</button>
                            <button onClick={() => deleteEntry(entry.id)} aria-label="Delete entry" className="text-[#251A14]/40 hover:text-[#FF5A5F]">×</button>
                          </div>
                        </div>
                        <p className={`${mono.className} mt-1 text-[10px] font-semibold text-[#251A14]/40`}>
                          {new Date(entry.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                        <div className={`${mono.className} mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium text-[#251A14]/60`}>
                          <div className="flex justify-between"><span>Calories</span><span className="font-bold text-[#251A14]">{entry.calories}</span></div>
                          <div className="flex justify-between"><span>Protein</span><span>{entry.protein}g</span></div>
                          <div className="flex justify-between"><span>Carbs</span><span>{entry.carbs}g</span></div>
                          <div className="flex justify-between"><span>Fat</span><span>{entry.fat}g</span></div>
                          <div className="flex justify-between"><span>Fiber</span><span>{entry.fiber}g</span></div>
                          <div className="flex justify-between"><span>Sugar</span><span>{entry.sugar}g</span></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <h2 className={`${display.className} text-xl font-extrabold`}>Weight trend</h2>
          <div className="mt-6">
            <WeightChart history={weightHistory} unit={unit} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
          <TipJar />
        </section>
      </div>

      <footer className="px-6 py-8 text-center text-xs font-semibold text-[#251A14]/40 md:px-12">
        Built one feature at a time.
      </footer>
    </div>
  );
}