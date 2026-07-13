"use client";

import { useEffect, useState } from "react";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface PlateRingProps {
  segments: Segment[];
  progress: number; // 0-1
  size?: number;
  centerValue: string;
  centerLabel: string;
}

export default function PlateRing({ segments, progress, size = 220, centerValue, centerLabel }: PlateRingProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(progress), 100);
    return () => clearTimeout(t);
  }, [progress]);

  const outerR = size / 2 - 10;
  const innerR = size / 2 - 32;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const length = fraction * outerCirc;
    const offset = -cumulative;
    cumulative += length;
    return { ...seg, length, offset };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={outerR} fill="none" stroke="#1C1B19" strokeOpacity={0.06} strokeWidth={8} />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={outerR}
            fill="none"
            stroke={a.color}
            strokeWidth={8}
            strokeDasharray={`${a.length} ${outerCirc - a.length}`}
            strokeDashoffset={a.offset}
          />
        ))}

        <circle cx={size / 2} cy={size / 2} r={innerR} fill="none" stroke="#1C1B19" strokeOpacity={0.06} strokeWidth={14} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          stroke="#1C1B19"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={innerCirc}
          strokeDashoffset={innerCirc * (1 - Math.min(1, animated))}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold leading-none">{centerValue}</span>
        <span className="mt-1 text-center text-[10px] uppercase tracking-[0.15em] text-[#1C1B19]/50">{centerLabel}</span>
      </div>
    </div>
  );
}
