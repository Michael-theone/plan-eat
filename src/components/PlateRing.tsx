"use client";

import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type RingSegment = {
  label: string;
  progress: number;
  color: string;
  glow: string;
};

export default function PlateRing({
  segments,
  centerValue,
  centerLabel,
  size = 220,
}: {
  segments: RingSegment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const strokeWidth = 14;
  const gap = 10;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {segments.map((s, i) => (
            <linearGradient key={s.label} id={`ring-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={s.color} />
              <stop offset="100%" stopColor={s.glow} />
            </linearGradient>
          ))}
        </defs>
        {segments.map((s, i) => {
          const radius = center - strokeWidth / 2 - i * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.min(1, Math.max(0, s.progress));
          return (
            <g key={s.label}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={`url(#ring-grad-${i})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - clamped)}
                style={{ transition: "stroke-dashoffset 0.8s ease-out", filter: `drop-shadow(0 0 6px ${s.color}66)` }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${display.className} text-3xl font-bold text-[#F5F5F3]`}>{centerValue}</span>
        <span className={`${mono.className} mt-1 text-[10px] uppercase tracking-[0.15em] text-[#F5F5F3]/45`}>
          {centerLabel}
        </span>
      </div>
    </div>
  );
}