"use client";

import { Oswald, IBM_Plex_Mono } from "next/font/google";

const display = Oswald({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function StreakCard({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="border-2 border-[#1A1A16] p-6">
      <h3 className={`${display.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#8C8577]`}>
        Streak
      </h3>
      <div className="mt-3 flex items-end gap-3">
        <span className={`${display.className} text-5xl font-bold`}>{current}</span>
        <span className="mb-1 text-sm text-[#4A473F]">day{current === 1 ? "" : "s"} in target range</span>
      </div>
      <p className={`${mono.className} mt-2 text-xs text-[#8C8577]`}>
        Longest streak: {longest} day{longest === 1 ? "" : "s"}
      </p>
      <p className="mt-3 text-[11px] text-[#8C8577]">
        Counts a day when your logged calories land within 20% of your daily target.
      </p>
    </div>
  );
}