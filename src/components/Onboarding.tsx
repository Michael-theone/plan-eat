"use client";

import { useState, useEffect } from "react";
import { Oswald, IBM_Plex_Mono } from "next/font/google";
import ProfileForm from "./ProfileForm";
import type { Profile } from "@/lib/nutrition";

const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Onboarding({
  initialWeight,
  initialUnit,
  initialProfile,
  onComplete,
}: {
  initialWeight: number;
  initialUnit: "kg" | "lb";
  initialProfile: Profile;
  onComplete: (weight: number, unit: "kg" | "lb", profile: Profile) => void;
}) {
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [weight, setWeight] = useState(initialWeight);
  const [unit, setUnit] = useState<"kg" | "lb">(initialUnit);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  // Keeps the form synced once your saved weight/profile finish loading
  // from storage (happens a beat after the very first render).
  useEffect(() => setWeight(initialWeight), [initialWeight]);
  useEffect(() => setUnit(initialUnit), [initialUnit]);
  useEffect(() => setProfile(initialProfile), [initialProfile]);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [started]);

  if (!started) {
    return (
      <div className={`flex justify-center pb-16 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={() => setStarted(true)}
          className="rounded-sm bg-[#1A1A16] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-[#FBF8F2] transition hover:bg-[#E4572E]"
        >
          Get started
        </button>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-2xl px-6 pb-16 transition-opacity duration-500 md:px-12 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="border-4 border-[#1A1A16] p-8">
        <h2 className={`${display.className} text-xl font-bold uppercase`}>Tell us about you</h2>
        <p className="mt-1 text-sm text-[#8C8577]">Takes 30 seconds — this is what builds your personal targets.</p>

        <div className="mt-6 border-2 border-[#1A1A16] p-6">
          <span className="text-xs font-semibold uppercase text-[#8C8577]">Weight</span>
          <div className="mt-2 flex items-end gap-4">
            <input
              type="number"
              min={0}
              value={weight}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              className={`${mono.className} w-28 border-b-2 border-[#1A1A16] bg-transparent pb-1 text-3xl font-medium outline-none focus-visible:border-[#E4572E]`}
            />
            <div className="mb-1 flex gap-1">
              {(["kg", "lb"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`rounded-sm border-2 border-[#1A1A16] px-3 py-1 text-xs font-semibold uppercase ${
                    unit === u ? "bg-[#1A1A16] text-[#FBF8F2]" : "bg-transparent"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProfileForm profile={profile} onChange={setProfile} />
        </div>

        <button
          onClick={() => onComplete(weight, unit, profile)}
          disabled={weight <= 0}
          className="mt-6 w-full rounded-sm bg-[#1A1A16] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#FBF8F2] transition hover:bg-[#E4572E] disabled:opacity-50"
        >
          See my targets
        </button>
      </div>
    </div>
  );
}