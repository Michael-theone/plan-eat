"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import { TAG_COLOR, pickMeals, calcTargets, DEFAULT_PROFILE, getDaySeed } from "@/lib/nutrition";
import type { Profile, ScanResult, FoodLogEntry, WeightEntry } from "@/lib/nutrition";
import ProfileForm from "@/components/ProfileForm";
import WeightChart from "@/components/WeightChart";
import MealEditor from "@/components/MealEditor";
interface DailyMeal {
  name: string;
  calories: number;
  protein: number;
  description: string;
}

const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"] });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

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
  

  // Fetch the daily meal when the dashboard loads
  useEffect(() => {
    fetch('/api/daily-meal')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setDailyMeal(data);
      })
      .catch(console.error);
  }, []);
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
    localStorage.setItem("plate-weight-history", JSON.stringify(weightHistory));
  }, [weightHistory]);

  useEffect(() => {
    localStorage.setItem("plate-food-log", JSON.stringify(foodLog));
  }, [foodLog]);

  const weightKg = unit === "kg" ? weight : weight * 0.453592;
  const { calories, protein, carbs, fat } = calcTargets(weightKg, profile);
  const recommended = pickMeals(calories, getDaySeed());

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

  return (
    <div className={`${body.className} min-h-screen bg-[#FBF8F2] text-[#1A1A16]`}>
      <header className="border-b-4 border-[#1A1A16] px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className={`${display.className} text-2xl font-bold tracking-tight`}>
            PLATE<span className="text-[#E4572E]">.</span>
          </span>
          <nav className="flex gap-3 text-[10px] font-medium uppercase tracking-wide sm:gap-8 sm:text-sm">
            <a href="#" className="hover:text-[#E4572E]">Dashboard</a>
            <a href="#" className="hover:text-[#E4572E]">Scan</a>
            <a href="#" className="hover:text-[#E4572E]">Meals</a>
            <a href="#" className="hover:text-[#E4572E]">Log</a>
          </nav>
        </div>
      </header>
      {/* AI Daily Meal Card */}
  {dailyMeal && (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-orange-600 mb-1">
          ✨ AI Meal of the Day
        </h2>
        <p className="font-bold text-lg text-zinc-900">{dailyMeal.name}</p>
        <p className="text-sm text-zinc-600 mb-3 md:mb-0">{dailyMeal.description}</p>
        <div className="flex gap-2 mt-2">
          <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-zinc-700 shadow-sm">
            {dailyMeal.calories} kcal
          </span>
          <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-zinc-700 shadow-sm">
            {dailyMeal.protein}g protein
          </span>
        </div>
      </div>
    </div>
  )}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:px-12">
        <p className={`${mono.className} text-xs uppercase tracking-[0.2em] text-[#8C8577]`}>
          Personal nutrition, not a generic chart
        </p>
        <h1 className={`${display.className} mt-4 max-w-2xl text-4xl font-bold leading-[1.05] md:text-6xl`}>
          Know exactly what&apos;s on your plate.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#4A473F]">
          Log your weight, scan a meal, and get targets built around your body — updated as you go.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 md:grid-cols-2 md:px-12">
        <div className="flex flex-col gap-8">
          <div className="border-2 border-[#1A1A16] p-8">
            <h2 className={`${display.className} text-xl font-semibold`}>Your weight</h2>
            <p className="mt-1 text-sm text-[#8C8577]">This drives every target below.</p>
            <div className="mt-6 flex items-end gap-4">
              <input
                type="number"
                min={0}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                className={`${mono.className} w-32 border-b-2 border-[#1A1A16] bg-transparent pb-1 text-4xl font-medium outline-none focus-visible:border-[#E4572E]`}
              />
              <div className="mb-1 flex gap-1">
                {(["kg", "lb"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`rounded-sm border-2 border-[#1A1A16] px-3 py-1 text-xs font-semibold uppercase focus-visible:outline-2 focus-visible:outline-[#E4572E] ${
                      unit === u ? "bg-[#1A1A16] text-[#FBF8F2]" : "bg-transparent"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={logWeightToday}
              className="mt-4 rounded-sm border-2 border-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#1A1A16] hover:text-[#FBF8F2]"
            >
              Log today&apos;s weight
            </button>
              {weightHistory.some((h) => h.date === todayDateStr()) && (
              <p className="mt-2 text-xs font-semibold text-[#6B8E4E]">✓ Logged for today</p>
            )}
          </div>

          <ProfileForm profile={profile} onChange={setProfile} />
        </div>

        <div className={`${mono.className} border-4 border-[#1A1A16] p-6`}>
          <h2 className={`${display.className} text-2xl font-bold uppercase`}>Daily Target</h2>
          <div className="mt-2 border-b-8 border-[#1A1A16]" />
          <div className="flex items-center justify-between border-b border-[#1A1A16] py-2 text-sm">
            <span className="font-semibold uppercase">Calories</span>
            <span className="text-lg font-bold">{calories} kcal</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#1A1A16] py-2 pl-4 text-sm">
            <span>Protein</span>
            <span>{protein} g</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#1A1A16] py-2 pl-4 text-sm">
            <span>Carbs</span>
            <span>{carbs} g</span>
          </div>
          <div className="flex items-center justify-between py-2 pl-4 text-sm">
            <span>Fat</span>
            <span>{fat} g</span>
          </div>
          <p className="mt-4 text-[11px] normal-case text-[#8C8577]">
            Based on your profile using the Mifflin-St Jeor formula — still an estimate, not medical advice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
          Today&apos;s progress
        </h2>
        <div className="mt-6 border-4 border-[#1A1A16] p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Calories", value: todayTotals.calories, target: calories, color: "#E4572E" },
              { label: "Protein", value: todayTotals.protein, target: protein, color: "#6B8E4E" },
              { label: "Carbs", value: todayTotals.carbs, target: carbs, color: "#F2B705" },
              { label: "Fat", value: todayTotals.fat, target: fat, color: "#8C8577" },
            ].map((m) => {
              const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0;
              const over = m.value > m.target;
              return (
                <div key={m.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide">{m.label}</span>
                    <span className={`${mono.className} text-xs ${over ? "font-semibold text-[#E4572E]" : "text-[#8C8577]"}`}>
                      {m.value} / {m.target}
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full border-2 border-[#1A1A16] bg-[#FBF8F2]">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: over ? "#E4572E" : m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`${mono.className} mt-6 text-[11px] normal-case text-[#8C8577]`}>
            {todayEntries.length === 0
              ? "Nothing logged yet today — scan or add a meal below to start tracking."
              : `Based on ${todayEntries.length} meal${todayEntries.length === 1 ? "" : "s"} logged today.`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
          Weight trend
        </h2>
        <div className="mt-6">
          <WeightChart history={weightHistory} unit={unit} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
          Today&apos;s picks · {calories} kcal target
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {recommended.map((meal) => (
            <div key={meal.tag} className="border-2 border-[#1A1A16] p-5">
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FBF8F2]"
                style={{ backgroundColor: TAG_COLOR[meal.tag] }}
              >
                {meal.tag}
              </span>
              <h3 className={`${display.className} mt-3 text-base font-semibold leading-tight`}>{meal.name}</h3>
              <div className={`${mono.className} mt-3 space-y-1 text-xs text-[#4A473F]`}>
                <div className="flex justify-between"><span>Calories</span><span className="font-semibold text-[#1A1A16]">{meal.calories}</span></div>
                <div className="flex justify-between"><span>Protein</span><span>{meal.protein}g</span></div>
                <div className="flex justify-between"><span>Carbs</span><span>{meal.carbs}g</span></div>
                <div className="flex justify-between"><span>Fat</span><span>{meal.fat}g</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
          Scan a meal
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="border-2 border-dashed border-[#1A1A16] p-8 text-center">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Selected meal" className="mx-auto max-h-56 rounded-sm object-cover" />
            ) : (
              <p className="text-sm text-[#8C8577]">Upload a photo of your meal</p>
            )}
            <label className="mt-4 inline-block cursor-pointer rounded-sm border-2 border-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#1A1A16] hover:text-[#FBF8F2]">
              {imagePreview ? "Choose a different photo" : "Choose photo"}
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            </label>
            {imagePreview && !pendingMeal && (
              <button
                onClick={handleScan}
                disabled={scanning}
                className="mt-4 block w-full rounded-sm bg-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#FBF8F2] disabled:opacity-50"
              >
                {scanning ? "Analyzing..." : "Scan meal"}
              </button>
            )}
            {scanError && <p className="mt-3 text-xs text-[#E4572E]">{scanError}</p>}
          </div>

          <div className="border-4 border-[#1A1A16] p-6">
            {pendingMeal ? (
              <>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#8C8577]">
                  Review before logging · confidence: {pendingMeal.confidence}
                </p>
                <MealEditor value={pendingMeal} onChange={(v) => setPendingMeal({ ...pendingMeal, ...v })} />
                <div className="mt-4 flex gap-2">
                  <button onClick={confirmScan} className="flex-1 rounded-sm bg-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#FBF8F2]">
                    Log this meal
                  </button>
                  <button onClick={discardScan} className="rounded-sm border-2 border-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                    Discard
                  </button>
                </div>
              </>
            ) : (
              <p className={`${mono.className} text-sm normal-case text-[#8C8577]`}>
                Your scan results will show up here for you to review before logging.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <div className="flex items-center justify-between">
          <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
            Add a meal manually
          </h2>
          {!manualMeal && (
            <button onClick={startManualEntry} className="text-xs font-semibold uppercase tracking-wide text-[#8C8577] hover:text-[#E4572E]">
              + Add meal
            </button>
          )}
        </div>
        {manualMeal && (
          <div className="mt-6 max-w-md border-4 border-[#1A1A16] p-6">
            <MealEditor value={manualMeal} onChange={setManualMeal} />
            <div className="mt-4 flex gap-2">
              <button
                onClick={confirmManual}
                disabled={!manualMeal.name.trim()}
                className="flex-1 rounded-sm bg-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#FBF8F2] disabled:opacity-50"
              >
                Add to log
              </button>
              <button onClick={() => setManualMeal(null)} className="rounded-sm border-2 border-[#1A1A16] px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-12">
        <div className="flex items-center justify-between">
          <h2 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
            Food log
          </h2>
          {foodLog.length > 0 && (
            <button onClick={() => setFoodLog([])} className="text-xs font-semibold uppercase tracking-wide text-[#8C8577] hover:text-[#E4572E]">
              Clear all
            </button>
          )}
        </div>

        {foodLog.length === 0 ? (
          <p className="mt-6 text-sm text-[#8C8577]">No meals logged yet — scan or add something above to get started.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foodLog.map((entry) => (
              <div key={entry.id} className="border-2 border-[#1A1A16]">
                {entry.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.image} alt={entry.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-[#F2EFE7] text-xs uppercase tracking-wide text-[#8C8577]">
                    Manually logged
                  </div>
                )}
                <div className="p-4">
                  {editingId === entry.id && editDraft ? (
                    <>
                      <MealEditor value={editDraft} onChange={setEditDraft} />
                      <div className="mt-3 flex gap-2">
                        <button onClick={saveEdit} className="flex-1 rounded-sm bg-[#1A1A16] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#FBF8F2]">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="rounded-sm border-2 border-[#1A1A16] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`${display.className} text-base font-semibold leading-tight`}>{entry.name}</h3>
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => startEdit(entry)} aria-label="Edit entry" className="text-[#8C8577] hover:text-[#E4572E]">✎</button>
                          <button onClick={() => deleteEntry(entry.id)} aria-label="Delete entry" className="text-[#8C8577] hover:text-[#E4572E]">×</button>
                        </div>
                      </div>
                      <p className={`${mono.className} mt-1 text-[10px] text-[#8C8577]`}>
                        {new Date(entry.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                      <div className={`${mono.className} mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#4A473F]`}>
                        <div className="flex justify-between"><span>Calories</span><span className="font-semibold text-[#1A1A16]">{entry.calories}</span></div>
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

      <footer className="border-t-4 border-[#1A1A16] px-6 py-6 text-center text-xs text-[#8C8577] md:px-12">
        Built one feature at a time.
      </footer>
    </div>
  );
}