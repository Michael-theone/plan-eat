"use client";

import { Fraunces, IBM_Plex_Mono } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface StreakCardProps {
  current: number;
  longest: number;
}

export default function StreakCard({ current, longest }: StreakCardProps) {
  return (
    <div className="rounded-2xl border border-[#1C1B19]/10 bg-[#FAF8F4] p-6 shadow-[0_8px_30px_rgba(28,27,25,0.06)]">
      <p className={`${mono.className} text-[10px] uppercase tracking-[0.2em] text-[#1C1B19]/50`}>Streak</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`${display.className} text-5xl font-bold text-[#C1440E]`}>{current}</span>
        <span className="text-sm text-[#1C1B19]/60">
          day{current === 1 ? "" : "s"} in target range
        </span>
      </div>
      <p className={`${mono.className} mt-3 text-xs text-[#1C1B19]/60`}>
        Longest streak: {longest} day{longest === 1 ? "" : "s"}
      </p>
      <p className="mt-4 text-xs text-[#1C1B19]/50">
        Counts a day when your logged calories land within 20% of your daily target.
      </p>
    </div>
  );
}
