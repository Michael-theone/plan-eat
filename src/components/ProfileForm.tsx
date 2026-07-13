"use client";

import { Oswald } from "next/font/google";
import type { Profile, ActivityLevel, Sex, Goal } from "@/lib/nutrition";

const display = Oswald({ subsets: ["latin"], weight: ["600"] });

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
    <div className="border-2 border-[#1A1A16] p-6">
      <h3 className={`${display.className} text-lg font-semibold`}>Your profile</h3>
      <p className="mt-1 text-sm text-[#8C8577]">Makes your target more accurate than weight alone.</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="text-xs font-semibold uppercase text-[#8C8577]">
          Age
          <input
            type="number"
            min={10}
            max={100}
            value={profile.age}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => onChange({ ...profile, age: Number(e.target.value) || 0 })}
            className="mt-1 block w-full border-b-2 border-[#1A1A16] bg-transparent py-1 text-base font-medium text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
          />
        </label>

        <label className="text-xs font-semibold uppercase text-[#8C8577]">
          Height (cm)
          <input
            type="number"
            min={100}
            max={250}
            value={profile.heightCm}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => onChange({ ...profile, heightCm: Number(e.target.value) || 0 })}
            className="mt-1 block w-full border-b-2 border-[#1A1A16] bg-transparent py-1 text-base font-medium text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
          />
        </label>

        <label className="text-xs font-semibold uppercase text-[#8C8577]">
          Sex
          <select
            value={profile.sex}
            onChange={(e) => onChange({ ...profile, sex: e.target.value as Sex })}
            className="mt-1 block w-full border-b-2 border-[#1A1A16] bg-transparent py-1 text-base font-medium text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase text-[#8C8577]">
          Goal
          <select
            value={profile.goal}
            onChange={(e) => onChange({ ...profile, goal: e.target.value as Goal })}
            className="mt-1 block w-full border-b-2 border-[#1A1A16] bg-transparent py-1 text-base font-medium text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
          >
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Gain weight</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase text-[#8C8577]">
        Activity level
        <select
          value={profile.activity}
          onChange={(e) => onChange({ ...profile, activity: e.target.value as ActivityLevel })}
          className="mt-1 block w-full border-b-2 border-[#1A1A16] bg-transparent py-1 text-sm font-medium normal-case text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
        >
          {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
            <option key={key} value={key}>
              {ACTIVITY_LABELS[key]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}