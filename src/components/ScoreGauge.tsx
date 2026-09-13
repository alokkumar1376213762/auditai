"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showGrade?: boolean;
}

export function ScoreGauge({
  score,
  grade,
  size = "lg",
  label = "Overall Score",
  showGrade = true,
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Dynamic count-up animation on score change
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    const startScore = displayScore;
    const endScore = Math.min(100, Math.max(0, score));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startScore + (endScore - startScore) * easeProgress);
      setDisplayScore(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  const clamped = displayScore;

  // Determine color matching Linear palette
  const getColor = (s: number) => {
    if (s >= 85)
      return { stroke: "#27a644", text: "text-[#27a644]", bg: "bg-[#27a644]/10 border-[#27a644]/30" };
    if (s >= 70)
      return { stroke: "#5e6ad2", text: "text-[#828fff]", bg: "bg-[#5e6ad2]/10 border-[#5e6ad2]/30" };
    if (s >= 50)
      return { stroke: "#f59e0b", text: "text-[#fbbf24]", bg: "bg-[#f59e0b]/10 border-[#f59e0b]/30" };
    return { stroke: "#eb5757", text: "text-[#eb5757]", bg: "bg-[#eb5757]/10 border-[#eb5757]/30" };
  };

  const { stroke, text, bg } = getColor(clamped);

  const dimensionMap = {
    sm: { size: 90, strokeWidth: 7, radius: 36, fontSize: "text-xl", gradeSize: "text-[10px]" },
    md: { size: 120, strokeWidth: 8, radius: 48, fontSize: "text-2xl", gradeSize: "text-xs" },
    lg: { size: 170, strokeWidth: 10, radius: 68, fontSize: "text-4xl", gradeSize: "text-xs" },
    xl: { size: 210, strokeWidth: 12, radius: 86, fontSize: "text-5xl", gradeSize: "text-sm" },
  };

  const config = dimensionMap[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
          className="rotate-[-90deg] transition-all duration-300"
        >
          {/* Background track */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={config.radius}
            fill="transparent"
            stroke="#141516"
            strokeWidth={config.strokeWidth}
          />

          {/* Active animated ring */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={config.radius}
            fill="transparent"
            stroke={stroke}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline">
            <span className={cn("font-semibold tracking-[-0.03em] text-[#f7f8f8]", config.fontSize)}>
              {clamped}
            </span>
            <span className="text-[#62666d] text-xs font-mono ml-0.5">/100</span>
          </div>

          {showGrade && (
            <div
              className={cn(
                "mt-0.5 px-2 py-0.2 rounded-full font-mono uppercase border tracking-wider transition-all duration-300",
                text,
                bg,
                config.gradeSize
              )}
            >
              Grade {grade}
            </div>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2.5 text-[11px] font-mono uppercase tracking-wider text-[#8a8f98]">
          {label}
        </span>
      )}
    </div>
  );
}
