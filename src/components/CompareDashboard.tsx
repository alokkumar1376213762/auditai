"use client";

import React, { useState } from "react";
import { Trophy, ArrowLeft, ExternalLink, Zap, Search, Eye, BookOpen, DollarSign, ShieldCheck, Share, CheckCircle2, XCircle } from "lucide-react";
import { WebsiteAuditReport } from "@/types/audit";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { soundManager } from "@/lib/sound";

interface CompareDashboardProps {
  reportA: WebsiteAuditReport;
  reportB: WebsiteAuditReport;
  onReset: () => void;
}

export function CompareDashboard({ reportA, reportB, onReset }: CompareDashboardProps) {
  const scoreA = reportA.overallScore;
  const scoreB = reportB.overallScore;
  const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "TIE";
  const delta = Math.abs(scoreA - scoreB);

  const domainA = reportA.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const domainB = reportB.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const pillarComparison: {
    key: keyof WebsiteAuditReport["pillars"];
    title: string;
    icon: any;
    scoreA: number;
    scoreB: number;
  }[] = [
    {
      key: "performance",
      title: "Speed & Core Web Vitals",
      icon: Zap,
      scoreA: reportA.pillars.performance.score,
      scoreB: reportB.pillars.performance.score,
    },
    {
      key: "seoAndAeo",
      title: "SEO, AEO & GEO Citations",
      icon: Search,
      scoreA: reportA.pillars.seoAndAeo.score,
      scoreB: reportB.pillars.seoAndAeo.score,
    },
    {
      key: "uxAndDesign",
      title: "UX & Visual Design",
      icon: Eye,
      scoreA: reportA.pillars.uxAndDesign.score,
      scoreB: reportB.pillars.uxAndDesign.score,
    },
    {
      key: "contentQuality",
      title: "Content Quality & Depth",
      icon: BookOpen,
      scoreA: reportA.pillars.contentQuality.score,
      scoreB: reportB.pillars.contentQuality.score,
    },
    {
      key: "conversion",
      title: "Conversion (CRO) Impact",
      icon: DollarSign,
      scoreA: reportA.pillars.conversion.score,
      scoreB: reportB.pillars.conversion.score,
    },
    {
      key: "trustAndCredibility",
      title: "Trust & Credibility",
      icon: ShieldCheck,
      scoreA: reportA.pillars.trustAndCredibility.score,
      scoreB: reportB.pillars.trustAndCredibility.score,
    },
    {
      key: "analyticsAndEngagement",
      title: "Analytics & Social Sharing",
      icon: Share,
      scoreA: reportA.pillars.analyticsAndEngagement.score,
      scoreB: reportB.pillars.analyticsAndEngagement.score,
    },
  ];

  return (
    <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between pb-6 border-b border-[#23252a]">
        <div>
          <div className="text-xs font-mono text-[#5e6ad2] uppercase tracking-wider">
            Competitive Benchmarking Arena
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#f7f8f8] mt-1 tracking-tight">
            {domainA} <span className="text-[#8a8f98] font-light">vs</span> {domainB}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Exit Comparison
        </Button>
      </div>

      {/* Dynamic Winner Card */}
      <div className="mt-6 p-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Overall Benchmark Verdict</span>
            <h3 className="text-lg font-bold text-[#f7f8f8]">
              {winner === "TIE" ? (
                "Draw — Both sites scored identically!"
              ) : (
                <>
                  <span className="text-[#5e6ad2]">
                    {winner === "A" ? domainA : domainB}
                  </span>{" "}
                  outperforms by <span className="text-[#27a644]">+{delta} points</span>
                </>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={winner === "A" ? "success" : "secondary"}>
            {domainA}: {scoreA}/100
          </Badge>
          <span className="text-xs text-[#8a8f98] font-mono">vs</span>
          <Badge variant={winner === "B" ? "success" : "secondary"}>
            {domainB}: {scoreB}/100
          </Badge>
        </div>
      </div>

      {/* Side-by-Side Overall Score Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Site A Card */}
        <div className={`p-6 rounded-[12px] bg-[#0f1011] border ${winner === "A" ? "border-[#5e6ad2]" : "border-[#23252a]"} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#f7f8f8]">{domainA}</span>
              {winner === "A" && <Badge variant="linear">Winner</Badge>}
            </div>
            <p className="text-xs text-[#8a8f98] mt-1 line-clamp-2 max-w-xs">{reportA.summary}</p>
            <div className="mt-3 text-[11px] font-mono text-[#8a8f98]">
              TTFB: <span className="text-white">{reportA.scrapedSignals.responseTimeMs}ms</span> • Actions: <span className="text-white">{reportA.actionItems.length}</span>
            </div>
          </div>
          <ScoreGauge score={scoreA} grade={reportA.grade} size="md" label="Score" />
        </div>

        {/* Site B Card */}
        <div className={`p-6 rounded-[12px] bg-[#0f1011] border ${winner === "B" ? "border-[#5e6ad2]" : "border-[#23252a]"} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#f7f8f8]">{domainB}</span>
              {winner === "B" && <Badge variant="linear">Winner</Badge>}
            </div>
            <p className="text-xs text-[#8a8f98] mt-1 line-clamp-2 max-w-xs">{reportB.summary}</p>
            <div className="mt-3 text-[11px] font-mono text-[#8a8f98]">
              TTFB: <span className="text-white">{reportB.scrapedSignals.responseTimeMs}ms</span> • Actions: <span className="text-white">{reportB.actionItems.length}</span>
            </div>
          </div>
          <ScoreGauge score={scoreB} grade={reportB.grade} size="md" label="Score" />
        </div>
      </div>

      {/* 7-Pillar Head-to-Head Breakdown Table */}
      <div className="mt-8 rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#141516] border-b border-[#23252a] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#f7f8f8]">7-Pillar Direct Comparison</span>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-[#828fff]">{domainA}</span>
            <span className="text-[#38bdf8]">{domainB}</span>
          </div>
        </div>

        <div className="divide-y divide-[#23252a]">
          {pillarComparison.map((p) => {
            const isAWinner = p.scoreA > p.scoreB;
            const isBWinner = p.scoreB > p.scoreA;
            const Icon = p.icon;

            return (
              <div key={p.key} className="p-4 hover:bg-[#141516]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-[6px] bg-[#18191a] border border-[#23252a] text-[#828fff]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#f7f8f8]">{p.title}</div>
                    <div className="text-[11px] text-[#8a8f98]">
                      {isAWinner
                        ? `${domainA} leads by +${p.scoreA - p.scoreB} pts`
                        : isBWinner
                        ? `${domainB} leads by +${p.scoreB - p.scoreA} pts`
                        : "Tied score"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0 font-mono text-xs">
                  {/* Score A Bar */}
                  <div className="flex items-center gap-2 w-28 justify-end">
                    <span className={isAWinner ? "font-bold text-[#27a644]" : "text-[#d0d6e0]"}>
                      {p.scoreA}
                    </span>
                    <div className="w-16 h-1.5 bg-[#18191a] rounded-full overflow-hidden border border-[#23252a]">
                      <div
                        className="h-full rounded-full bg-[#5e6ad2]"
                        style={{ width: `${p.scoreA}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-[#62666d]">vs</span>

                  {/* Score B Bar */}
                  <div className="flex items-center gap-2 w-28">
                    <div className="w-16 h-1.5 bg-[#18191a] rounded-full overflow-hidden border border-[#23252a]">
                      <div
                        className="h-full rounded-full bg-[#38bdf8]"
                        style={{ width: `${p.scoreB}%` }}
                      />
                    </div>
                    <span className={isBWinner ? "font-bold text-[#27a644]" : "text-[#d0d6e0]"}>
                      {p.scoreB}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
