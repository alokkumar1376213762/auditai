"use client";

import React, { useState } from "react";
import { ComprehensivePillar, WebsiteAuditReport } from "@/types/audit";

interface PillarsRadarChartProps {
  pillars: WebsiteAuditReport["pillars"];
}

interface PillarAxis {
  key: keyof WebsiteAuditReport["pillars"];
  label: string;
  shortLabel: string;
}

const AXES: PillarAxis[] = [
  { key: "performance", label: "Performance & CWV", shortLabel: "Speed" },
  { key: "seoAndAeo", label: "SEO, AEO & GEO", shortLabel: "AEO/SEO" },
  { key: "uxAndDesign", label: "UX & Visual Design", shortLabel: "UX" },
  { key: "contentQuality", label: "Content Quality", shortLabel: "Content" },
  { key: "conversion", label: "Conversion (CRO)", shortLabel: "CRO" },
  { key: "trustAndCredibility", label: "Trust & Security", shortLabel: "Trust" },
  { key: "analyticsAndEngagement", label: "Analytics & Social", shortLabel: "Analytics" },
];

export function PillarsRadarChart({ pillars }: PillarsRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const radius = 105;
  const totalAxes = AXES.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Compute point for a given axis and value (0-100)
  const getCoordinates = (index: number, value: number) => {
    // Start from top (-PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Grid concentric rings (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  // Polygon points for active scores
  const polygonPoints = AXES.map((axis, i) => {
    const score = pillars[axis.key]?.score || 0;
    const { x, y } = getCoordinates(i, score);
    return `${x},${y}`;
  }).join(" ");

  const activePillar = hoveredIndex !== null ? pillars[AXES[hoveredIndex].key] : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-[12px] bg-[#0f1011] border border-[#23252a] relative select-none">
      <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-[#23252a] mb-2">
        <span className="font-semibold text-[#f7f8f8]">7-Pillar Architecture Radar</span>
        <span className="text-[#8a8f98] font-mono text-[11px]">Dynamic Web Topology</span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric Polygons */}
          {gridLevels.map((lvl) => {
            const points = AXES.map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            }).join(" ");
            return (
              <polygon
                key={lvl}
                points={points}
                fill="transparent"
                stroke="#23252a"
                strokeWidth={lvl === 100 ? 1.5 : 1}
                strokeDasharray={lvl === 100 ? "none" : "2 2"}
              />
            );
          })}

          {/* Radial Spokes */}
          {AXES.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#23252a"
                strokeWidth="1"
              />
            );
          })}

          {/* Dynamic Score Polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(94, 106, 210, 0.25)"
            stroke="#5e6ad2"
            strokeWidth="2"
            className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(94,106,210,0.5)]"
          />

          {/* Vertex Points & Interactive Hotspots */}
          {AXES.map((axis, i) => {
            const score = pillars[axis.key]?.score || 0;
            const { x, y } = getCoordinates(i, score);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={axis.key}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible larger hover area */}
                <circle cx={x} cy={y} r="14" fill="transparent" />

                {/* Visible vertex dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={score >= 80 ? "#27a644" : score >= 60 ? "#f59e0b" : "#eb5757"}
                  stroke="#010102"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Labels around periphery */}
          {AXES.map((axis, i) => {
            const labelCoord = getCoordinates(i, 118);
            const score = pillars[axis.key]?.score || 0;
            const isHovered = hoveredIndex === i;

            return (
              <text
                key={axis.key}
                x={labelCoord.x}
                y={labelCoord.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontFamily="sans-serif"
                className={`transition-colors cursor-pointer ${
                  isHovered ? "fill-[#5e6ad2] font-bold" : "fill-[#8a8f98] hover:fill-[#f7f8f8]"
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {axis.shortLabel} ({score})
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePillar && hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141516] border border-[#5e6ad2] p-2.5 rounded-[8px] shadow-xl text-center pointer-events-none min-w-[140px] animate-in fade-in duration-100 z-10">
            <div className="text-[11px] font-semibold text-[#f7f8f8]">{activePillar.title}</div>
            <div className="text-base font-bold font-mono text-[#828fff] mt-0.5">
              {activePillar.score} / 100
            </div>
            <div className="text-[10px] text-[#8a8f98]">{activePillar.status}</div>
          </div>
        )}
      </div>

      <div className="mt-2 text-[10px] text-[#62666d] font-mono text-center">
        Hover vertices to inspect pillar parameters
      </div>
    </div>
  );
}
