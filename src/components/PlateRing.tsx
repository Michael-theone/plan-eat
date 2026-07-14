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
    const t = setTimeout(() => setAnimated(progress), 150);
    return () => clearTimeout(t);
  }, [progress]);

  const outerR = size / 2 - 12;
  const innerR = size / 2 - 38;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const gap = outerCirc * 0.015;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const length = Math.max(0, fraction * outerCirc - gap);
    const offset = -cumulative;
    cumulative += fraction * outerCirc;
    return { ...seg, length, offset };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={outerR} fill="none" stroke="#251A14" strokeOpacity={0.08} strokeWidth={10} />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={outerR}
            fill="none"
            stroke={a.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${a.length} ${outerCirc - a.length}`}
            strokeDashoffset={a.offset}
          />
        ))}

        <circle cx={size / 2} cy={size / 2} r={innerR} fill="none" stroke="#251A14" strokeOpacity={0.08} strokeWidth={16} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          stroke="#251A14"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={innerCirc}
          strokeDashoffset={innerCirc * (1 - Math.min(1, animated))}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black leading-none" style={{ color: "#251A14" }}>
          {centerValue}
        </span>
        <span
          className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: "#251A14", opacity: 0.5 }}
        >
          {centerLabel}
        </span>
      </div>
    </div>
  );
}