"use client";

import React from "react";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#23252a] bg-[#010102] py-8 text-[#8a8f98] text-xs no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[3px] bg-[#5e6ad2] flex items-center justify-center text-white text-[9px] font-bold">
              ▲
            </div>
            <span className="font-semibold text-[#f7f8f8]">AuditAI</span>
            <span className="text-[#34343a]">/</span>
            <span className="text-[11px] text-[#62666d]">Designed per getdesign.md spec</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8a8f98]">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#5e6ad2]" />
              Groq LPU Hardware
            </span>
            <span className="text-[#23252a]">•</span>
            <span>Next.js 16</span>
            <span className="text-[#23252a]">•</span>
            <span>Tailwind CSS</span>
          </div>

          <div className="text-[11px] text-[#62666d] font-mono">
            © {new Date().getFullYear()} AuditAI
          </div>
        </div>
      </div>
    </footer>
  );
}
