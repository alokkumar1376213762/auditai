"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Shield, Zap, Search, Eye, Sparkles, CheckCircle2 } from "lucide-react";

interface LiveAuditScannerProps {
  url: string;
  loadingStep: string;
  model: string;
}

interface ScanLog {
  id: string;
  time: string;
  category: string;
  message: string;
  done: boolean;
}

export function LiveAuditScanner({ url, loadingStep, model }: LiveAuditScannerProps) {
  const [progress, setProgress] = useState(12);
  const [logs, setLogs] = useState<ScanLog[]>([
    {
      id: "1",
      time: "+0.04s",
      category: "SOCKET",
      message: `Establishing TLS handshake with ${url.replace(/^https?:\/\//, "")}...`,
      done: true,
    },
  ]);

  useEffect(() => {
    const timeline = [
      {
        delay: 500,
        pct: 28,
        log: {
          id: "2",
          time: "+0.22s",
          category: "DOM",
          message: "Extracting semantic nodes, head meta tags & script payloads...",
          done: true,
        },
      },
      {
        delay: 1300,
        pct: 49,
        log: {
          id: "3",
          time: "+0.54s",
          category: "PERF",
          message: "Benchmarking TTFB, Core Web Vitals (LCP, INP, CLS) & render-blocking CSS...",
          done: true,
        },
      },
      {
        delay: 2100,
        pct: 68,
        log: {
          id: "4",
          time: "+0.92s",
          category: "AEO/GEO",
          message: "Scanning Schema.org JSON-LD & LLM answer engine citation readiness...",
          done: true,
        },
      },
      {
        delay: 2900,
        pct: 86,
        log: {
          id: "5",
          time: "+1.35s",
          category: "A11Y",
          message: "Verifying WCAG 2.1 AA color contrast ratios, alt tags & keyboard traps...",
          done: true,
        },
      },
      {
        delay: 3700,
        pct: 95,
        log: {
          id: "6",
          time: "+1.78s",
          category: "GROQ AI",
          message: `Synthesizing 7-pillar executive ratings via ${model}...`,
          done: true,
        },
      },
    ];

    const timeouts = timeline.map((item) =>
      setTimeout(() => {
        setProgress((prev) => Math.max(prev, item.pct));
        setLogs((prev) => [...prev, item.log]);
      }, item.delay)
    );

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [url, model]);

  return (
    <div className="mt-5 text-left rounded-[12px] bg-[#0c0d0e] border border-[#23252a] overflow-hidden shadow-2xl shadow-black/60 font-mono text-xs max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2 bg-[#141516] border-b border-[#23252a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eb5757]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27a644]/80" />
          </div>
          <span className="text-[#8a8f98] text-[11px] ml-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-[#5e6ad2]" />
            <span>diagnostic_engine // {url.replace(/^https?:\/\//, "")}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27a644] animate-pulse" />
          <span className="text-[#34d399]">{progress}%</span>
        </div>
      </div>

      {/* Progress Bar with glowing neon line */}
      <div className="w-full bg-[#18191a] h-1 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#5e6ad2] to-[#828fff] h-full transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-xs" />
        </div>
      </div>

      {/* Active Stage & Stream Logs */}
      <div className="p-3.5 space-y-2 max-h-56 overflow-y-auto">
        <div className="text-[#8a8f98] text-[11px] pb-1 border-b border-[#1c1e22] flex items-center justify-between">
          <span>Active Scanner Status:</span>
          <span className="text-[#828fff] animate-pulse">{loadingStep || "Analyzing..."}</span>
        </div>

        <div className="space-y-1.5 pt-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] leading-tight animate-in fade-in duration-100">
              <span className="text-[#62666d] shrink-0">{log.time}</span>
              <span className="px-1 py-0.2 rounded bg-[#18191a] text-[#5e6ad2] font-semibold text-[10px] shrink-0">
                {log.category}
              </span>
              <span className="text-[#d0d6e0] flex-grow">{log.message}</span>
              {log.done && <CheckCircle2 className="w-3 h-3 text-[#27a644] shrink-0 mt-0.5" />}
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-2 text-[#8a8f98] text-[11px]">
          <span className="inline-block w-1.5 h-3 bg-[#5e6ad2] animate-pulse" />
          <span className="text-[10px] text-[#62666d]">Awaiting response from LPU accelerator...</span>
        </div>
      </div>
    </div>
  );
}
