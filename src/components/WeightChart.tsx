"use client";

import type { WeightEntry } from "@/lib/nutrition";

interface WeightChartProps {
  history: WeightEntry[];
  unit: "kg" | "lb";
}

export default function WeightChart({ history, unit }: WeightChartProps) {
  if (history.length < 2) {
    return (
      <div className="rounded-3xl border-[3px] border-[#251A14] bg-white p-8 text-center shadow-[4px_4px_0_0_#251A14]">
        <p className="text-sm font-semibold text-[#251A14]/60">
          Log your weight on at least two different days to see a trend line here.
        </p>
      </div>
    );
  }

  const toDisplay = (kg: number) => (unit === "kg" ? kg : kg / 0.453592);
  const values = history.map((h) => toDisplay(h.weightKg));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 600;
  const h = 200;
  const pad = 20;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-3xl border-[3px] border-[#251A14] bg-white p-6 shadow-[4px_4px_0_0_#251A14]">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#FF5A5F"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const [x, y] = points[i].split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r={5} fill="#251A14" stroke="#FF5A5F" strokeWidth={2} />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wide text-[#251A14]/40">
        <span>{history[0].date}</span>
        <span>{history[history.length - 1].date}</span>
      </div>
    </div>
  );
}