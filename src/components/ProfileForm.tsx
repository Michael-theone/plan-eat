"use client";

import type { Profile, Sex, Goal, ActivityLevel } from "@/lib/nutrition";

interface ProfileFormProps {
  profile: Profile;
  onChange: (p: Profile) => void;
}

const GOALS: { value: Goal; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain weight" },
];

const ACTIVITY: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary — little or no exercise" },
  { value: "light", label: "Light — 1-3 days/week" },
  { value: "moderate", label: "Moderate — 3-5 days/week" },
  { value: "active", label: "Active — 6-7 days/week" },
  { value: "very_active", label: "Very active — hard exercise daily" },
];

export default function ProfileForm({ profile, onChange }: ProfileFormProps) {
  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1B19]/50">Age</span>
          <input
            type="number"
            min={13}
            max={100}
            value={profile.age}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("age", Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-[#1C1B19]/15 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#C1440E]"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1B19]/50">Height (cm)</span>
          <input
            type="number"
            min={100}
            max={250}
            value={profile.heightCm}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("heightCm", Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-[#1C1B19]/15 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#C1440E]"
          />
        </label>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1B19]/50">Sex</span>
        <div className="mt-1 flex gap-2">
          {(["male", "female"] as Sex[]).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("sex", s)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                profile.sex === s
                  ? "border-[#1C1B19] bg-[#1C1B19] text-[#FAF8F4]"
                  : "border-[#1C1B19]/15 bg-white text-[#1C1B19]/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1B19]/50">Goal</span>
        <div className="mt-1 flex gap-2">
          {GOALS.map((g) => (
            <button
              type="button"
              key={g.value}
              onClick={() => set("goal", g.value)}
              className={`flex-1 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
                profile.goal === g.value
                  ? "border-[#C1440E] bg-[#C1440E] text-white"
                  : "border-[#1C1B19]/15 bg-white text-[#1C1B19]/70"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1B19]/50">Activity level</span>
        <select
          value={profile.activityLevel}
          onChange={(e) => set("activityLevel", e.target.value as ActivityLevel)}
          className="mt-1 w-full rounded-xl border border-[#1C1B19]/15 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#C1440E]"
        >
          {ACTIVITY.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
