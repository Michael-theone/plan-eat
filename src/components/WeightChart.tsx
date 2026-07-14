"use client";

import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import type { WeightEntry } from "@/lib/nutrition";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function WeightChart({ history, unit }: { history: WeightEntry[]; unit: "kg" | "lb" }) {
  if (history.length < 2) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#14161A] p-6">
        <h3 className={`${display.className} text-lg font-semibold text-[#F5F5F3]`}>Weight trend</h3>
        <p className="mt-2 text-sm text-[#F5F5F3]/45">
          Log your weight on at least two different days to see a trend line here.
        </p>
      </div>
    );
  }

  const toDisplay = (kg: number) => (unit === "kg" ? kg : kg * 2.20462);
  const values = history.map((h) => toDisplay(h.weightKg));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 600;
  const height = 180;
  const padding = 24;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-[#14161A] p-6">
      <div className="flex items-baseline justify-between">
        <h3 className={`${display.className} text-lg font-semibold text-[#F5F5F3]`}>Weight trend</h3>
        <span className={`${mono.className} text-xs text-[#F5F5F3]/45`}>
          {values[0].toFixed(1)} → {values[values.length - 1].toFixed(1)} {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <defs>
          <linearGradient id="weight-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#FF5470" />
          </linearGradient>
        </defs>
        <polyline points={points.join(" ")} fill="none" stroke="url(#weight-line)" strokeWidth={3} strokeLinecap="round" />
        {values.map((v, i) => {
          const [x, y] = points[i].split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r={4} fill="#F5F5F3" />;
        })}
      </svg>
      <div className={`${mono.className} mt-1 flex justify-between text-[10px] text-[#F5F5F3]/40`}>
        <span>{history[0].date}</span>
        <span>{history[history.length - 1].date}</span>
      </div>
    </div>
  );
}