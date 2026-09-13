"use client";

import Link from "next/link";
import { Zap, CheckCircle2, Key, Terminal, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onOpenKeyModal: () => void;
  hasApiKey: boolean;
  selectedModel: string;
}

export function Navbar({ onOpenKeyModal, hasApiKey, selectedModel }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-[56px] border-b border-[#23252a] bg-[#010102]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-[#5e6ad2] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <span className="font-mono">▲</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-[-0.02em] text-[#f7f8f8]">
              Audit<span className="text-[#5e6ad2]">AI</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-[4px] bg-[#141516] text-[#8a8f98] border border-[#23252a]">
              Engine
            </span>
          </div>
        </Link>

        {/* Center: Groq LPU Engine pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#0f1011] border border-[#23252a] text-xs text-[#8a8f98]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27a644]" />
          <span className="text-[#d0d6e0] font-medium">Groq LPU Acceleration</span>
          <span className="text-[#34343a]">/</span>
          <span className="font-mono text-[11px] text-[#5e6ad2]">
            {selectedModel.includes("70b") ? "Llama 3.3 70B" : "Llama 3.1 8B"}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/leads"
            className="px-2.5 py-1 rounded-[6px] bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#34343a] text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition flex items-center gap-1.5"
            title="View Captured Leads"
          >
            <Users className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span className="hidden sm:inline">Leads CRM</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#141516] border border-[#23252a] text-xs font-mono text-[#27a644]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27a644] animate-pulse" />
            <span className="hidden sm:inline">Groq Connected</span>
            <span className="sm:hidden">Active</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-[6px] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#141516] border border-transparent hover:border-[#23252a] transition flex items-center justify-center"
            title="GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
