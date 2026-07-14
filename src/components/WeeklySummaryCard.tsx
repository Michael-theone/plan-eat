"use client";

import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type WeekDay = { label: string; hit: boolean };

export default function WeeklySummaryCard({
  days,
  avgCalories,
  avgProtein,
  daysHit,
}: {
  days: WeekDay[];
  avgCalories: number;
  avgProtein: number;
  daysHit: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#14161A] p-6">
      <h3 className={`${display.className} text-lg font-semibold text-[#F5F5F3]`}>This week</h3>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={`${mono.className} text-[10px] text-[#F5F5F3]/40`}>{d.label}</span>
            <div
              className="mt-1 h-10 w-full rounded-lg border border-white/10"
              style={{ background: d.hit ? "linear-gradient(180deg, #8B5CF6, #FF5470)" : "rgba(255,255,255,0.06)" }}
            />
          </div>
        ))}
      </div>
      <div className={`${mono.className} mt-6 grid grid-cols-3 gap-4 text-center text-sm`}>
        <div>
          <div className="text-xl font-bold text-[#F5F5F3]">{avgCalories}</div>
          <div className="text-[10px] uppercase text-[#F5F5F3]/40">Avg kcal</div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#F5F5F3]">{avgProtein}g</div>
          <div className="text-[10px] uppercase text-[#F5F5F3]/40">Avg protein</div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#F5F5F3]">{daysHit}/7</div>
          <div className="text-[10px] uppercase text-[#F5F5F3]/40">Days on target</div>
        </div>
      </div>
    </div>
  );
}