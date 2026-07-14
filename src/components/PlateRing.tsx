"use client";

import { useEffect, useRef, useState } from "react";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface ArcSegment extends Segment {
  length: number;
  offset: number;
  fraction: number;
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
  const [ringT, setRingT] = useState(0); // 0 -> 1 draw-in progress for the outer macro ring
  const [hovered, setHovered] = useState<ArcSegment | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const prevValue = useRef(centerValue);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Inner progress ring — animate towards today's progress.
  useEffect(() => {
    if (reduceMotion.current) {
      setAnimated(progress);
      return;
    }
    const t = setTimeout(() => setAnimated(progress), 100);
    return () => clearTimeout(t);
  }, [progress]);

  // Outer macro ring — draw in whenever the macro split changes (new targets, new profile, etc).
  const segmentKey = segments.map((s) => `${s.label}:${s.value}`).join(",");
  useEffect(() => {
    if (reduceMotion.current) {
      setRingT(1);
      return;
    }
    setRingT(0);
    const t = setTimeout(() => setRingT(1), 150);
    return () => clearTimeout(t);
  }, [segmentKey]);

  // Little "pop" whenever the headline number actually changes (e.g. a meal was just logged).
  useEffect(() => {
    if (prevValue.current !== centerValue) {
      prevValue.current = centerValue;
      setPulseKey((k) => k + 1);
    }
  }, [centerValue]);

  const outerR = size / 2 - 10;
  const innerR = size / 2 - 32;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumulative = 0;
  const arcs: ArcSegment[] = segments.map((seg) => {
    const fraction = seg.value / total;
    const length = fraction * outerCirc;
    const offset = -cumulative;
    cumulative += length;
    return { ...seg, length, offset, fraction };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <style>{`
        @keyframes plate-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>

      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={outerR} fill="none" stroke="#1C1B19" strokeOpacity={0.06} strokeWidth={8} />
        {arcs.map((a) => {
          const isHovered = hovered?.label === a.label;
          const isDimmed = hovered !== null && !isHovered;
          const drawnLength = a.length * ringT;
          return (
            <circle
              key={a.label}
              cx={size / 2}
              cy={size / 2}
              r={outerR}
              fill="none"
              stroke={a.color}
              strokeWidth={isHovered ? 11 : 8}
              strokeLinecap="round"
              strokeDasharray={`${drawnLength} ${outerCirc - drawnLength}`}
              strokeDashoffset={a.offset}
              opacity={isDimmed ? 0.35 : 1}
              className="cursor-pointer outline-none transition-[stroke-width,opacity,stroke-dasharray] duration-700 ease-out motion-reduce:duration-0"
              tabIndex={0}
              aria-label={`${a.label}: ${Math.round(a.fraction * 100)}%`}
              onMouseEnter={() => setHovered(a)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(a)}
              onBlur={() => setHovered(null)}
            />
          );
        })}

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
          className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:duration-0"
        />
      </svg>

      <div className="pointer-events-none absolute flex flex-col items-center">
        {hovered ? (
          <>
            <span className="text-2xl font-bold leading-none" style={{ color: hovered.color }}>
              {Math.round(hovered.fraction * 100)}%
            </span>
            <span className="mt-1 text-center text-[10px] uppercase tracking-[0.15em] text-[#1C1B19]/50">
              {hovered.label}
            </span>
          </>
        ) : (
          <>
            <span
              key={pulseKey}
              className="text-3xl font-bold leading-none motion-safe:[animation:plate-pop_450ms_ease-out]"
            >
              {centerValue}
            </span>
            <span className="mt-1 text-center text-[10px] uppercase tracking-[0.15em] text-[#1C1B19]/50">
              {centerLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}