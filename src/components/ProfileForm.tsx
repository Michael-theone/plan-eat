"use client";

import { Space_Grotesk } from "next/font/google";
import type { Profile, ActivityLevel, Sex, Goal } from "@/lib/nutrition";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600"] });

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  very_active: "Very active (hard exercise daily)",
};

export default function ProfileForm({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
}) {
  return (
    <div>
      <h3 className={`${display.className} text-lg font-semibold text-[#F5F5F3]`}>Your profile</h3>
      <p className="mt-1 text-sm text-[#F5F5F3]/50">Makes your target more accurate than weight alone.</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#F5F5F3]/45">
          Age
          <input
            type="number"
            min={10}
            max={100}
            value={profile.age}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => onChange({ ...profile, age: Number(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-medium text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-[#F5F5F3]/45">
          Height (cm)
          <input
            type="number"
            min={100}
            max={250}
            value={profile.heightCm}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => onChange({ ...profile, heightCm: Number(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-medium text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-[#F5F5F3]/45">
          Sex
          <select
            value={profile.sex}
            onChange={(e) => onChange({ ...profile, sex: e.target.value as Sex })}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-medium text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
          >
            <option className="bg-[#15171B]" value="male">Male</option>
            <option className="bg-[#15171B]" value="female">Female</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-[#F5F5F3]/45">
          Goal
          <select
            value={profile.goal}
            onChange={(e) => onChange({ ...profile, goal: e.target.value as Goal })}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-medium text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
          >
            <option className="bg-[#15171B]" value="lose">Lose weight</option>
            <option className="bg-[#15171B]" value="maintain">Maintain</option>
            <option className="bg-[#15171B]" value="gain">Gain weight</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#F5F5F3]/45">
        Activity level
        <select
          value={profile.activityLevel}
          onChange={(e) => onChange({ ...profile, activityLevel: e.target.value as ActivityLevel })}
          className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium normal-case text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
        >
          {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
            <option className="bg-[#15171B]" key={key} value={key}>
              {ACTIVITY_LABELS[key]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}