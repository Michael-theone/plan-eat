"use client";

import { IBM_Plex_Mono } from "next/font/google";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface DayHit {
  label: string;
  hit: boolean;
}

interface WeeklySummaryCardProps {
  days: DayHit[];
  avgCalories: number;
  avgProtein: number;
  daysHit: number;
}

export default function WeeklySummaryCard({ days, avgCalories, avgProtein, daysHit }: WeeklySummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#1C1B19]/10 bg-[#FAF8F4] p-6 shadow-[0_8px_30px_rgba(28,27,25,0.06)]">
      <p className={`${mono.className} text-[10px] uppercase tracking-[0.2em] text-[#1C1B19]/50`}>This week</p>

      <div className="mt-4 flex justify-between">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase text-[#1C1B19]/50">{d.label}</span>
            <span className={`h-3 w-3 rounded-full ${d.hit ? "bg-[#6B7A4F]" : "bg-[#1C1B19]/10"}`} />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-bold">{avgCalories}</p>
          <p className="text-[10px] uppercase text-[#1C1B19]/50">Avg kcal</p>
        </div>
        <div>
          <p className="text-xl font-bold">{avgProtein}g</p>
          <p className="text-[10px] uppercase text-[#1C1B19]/50">Avg protein</p>
        </div>
        <div>
          <p className="text-xl font-bold">{daysHit}/7</p>
          <p className="text-[10px] uppercase text-[#1C1B19]/50">Days on target</p>
        </div>
      </div>
    </div>
  );
}
