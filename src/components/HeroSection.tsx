"use client";

import React, { useState } from "react";
import { Globe, ArrowRight, Loader2, Zap, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveAuditScanner } from "@/components/LiveAuditScanner";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  onCompare?: (urlA: string, urlB: string) => void;
  isLoading: boolean;
  loadingStep: string;
  model: string;
}

const SAMPLE_WEBSITES = [
  { name: "Stripe", url: "https://stripe.com", tag: "Fintech" },
  { name: "Linear", url: "https://linear.app", tag: "SaaS" },
  { name: "Vercel", url: "https://vercel.com", tag: "Infra" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", tag: "DevTools" },
  { name: "GitHub", url: "https://github.com", tag: "Dev Platform" },
];

const SAMPLE_COMPETITIVE_PAIRS = [
  { name: "Linear vs Jira", urlA: "https://linear.app", urlB: "https://jira.atlassian.com" },
  { name: "Stripe vs PayPal", urlA: "https://stripe.com", urlB: "https://paypal.com" },
  { name: "Vercel vs Netlify", urlA: "https://vercel.com", urlB: "https://netlify.com" },
];

export function HeroSection({
  onAnalyze,
  onCompare,
  isLoading,
  loadingStep,
  model,
}: HeroSectionProps) {
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [inputUrl, setInputUrl] = useState("");
  const [compareUrlA, setCompareUrlA] = useState("");
  const [compareUrlB, setCompareUrlB] = useState("");

  // Lead capture popup state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState("");
  const [pendingCompare, setPendingCompare] = useState<{ urlA: string; urlB: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === "single") {
      if (!inputUrl.trim()) return;
      setPendingTargetUrl(inputUrl.trim());
      setPendingCompare(null);
      setIsLeadModalOpen(true);
    } else {
      if (!compareUrlA.trim() || !compareUrlB.trim()) return;
      setPendingTargetUrl(`${compareUrlA.trim()} vs ${compareUrlB.trim()}`);
      setPendingCompare({ urlA: compareUrlA.trim(), urlB: compareUrlB.trim() });
      setIsLeadModalOpen(true);
    }
  };

  const handleSampleClick = (url: string) => {
    setInputUrl(url);
    setPendingTargetUrl(url);
    setPendingCompare(null);
    setIsLeadModalOpen(true);
  };

  const handleSamplePairClick = (pair: { urlA: string; urlB: string }) => {
    setCompareUrlA(pair.urlA);
    setCompareUrlB(pair.urlB);
    setPendingTargetUrl(`${pair.urlA} vs ${pair.urlB}`);
    setPendingCompare({ urlA: pair.urlA, urlB: pair.urlB });
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = () => {
    setIsLeadModalOpen(false);
    if (pendingCompare && onCompare) {
      onCompare(pendingCompare.urlA, pendingCompare.urlB);
    } else if (pendingTargetUrl) {
      onAnalyze(pendingTargetUrl);
    }
  };

  return (
    <section className="relative pt-16 pb-20 overflow-hidden linear-grid">
      {/* Linear subtle radial top illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] linear-radial-glow pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141516] border border-[#23252a] text-[#8a8f98] text-xs font-mono tracking-tight mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
          <span>7-Pillar Commercial Website Audit</span>
          <span className="text-[#34343a]">/</span>
          <span className="text-[#d0d6e0]">Groq LPU Engine</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#f7f8f8] max-w-3xl mx-auto leading-[1.1]">
          Rate websites with <br />
          <span className="text-[#5e6ad2]">precision intelligence.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-[#8a8f98] max-w-xl mx-auto leading-relaxed">
          Evaluate Core Web Vitals, AEO/GEO citations, visual hierarchy, conversion friction, and WCAG
          compliance in under 2 seconds.
        </p>

        {/* Mode Switcher Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex p-1 rounded-[8px] bg-[#0f1011] border border-[#23252a] text-xs">
            <button
              type="button"
              onClick={() => setMode("single")}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition flex items-center gap-1.5 ${
                mode === "single"
                  ? "bg-[#18191a] text-[#f7f8f8] border border-[#34343a] shadow-xs"
                  : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>Single Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("compare")}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition flex items-center gap-1.5 ${
                mode === "compare"
                  ? "bg-[#18191a] text-[#f7f8f8] border border-[#34343a] shadow-xs"
                  : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Head-to-Head Compare</span>
            </button>
          </div>
        </div>

        {/* URL Input Bar */}
        <div className="mt-6 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {mode === "single" ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#0f1011] border border-[#23252a] rounded-[10px] shadow-lg focus-within:border-[#5e6ad2] transition-colors">
                <div className="flex items-center w-full pl-2.5 pr-2">
                  <Globe className="w-4 h-4 text-[#8a8f98] shrink-0 mr-2" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter website domain (e.g. stripe.com)"
                    disabled={isLoading}
                    className="w-full h-10 bg-transparent text-sm text-[#f7f8f8] placeholder-[#62666d] focus:outline-none font-sans"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading || !inputUrl.trim()}
                  className="w-full sm:w-auto shrink-0 text-xs px-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span>Audit Website</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 p-2 bg-[#0f1011] border border-[#23252a] rounded-[10px] shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center px-2.5 bg-[#141516] border border-[#23252a] rounded-[6px]">
                    <span className="text-[11px] font-mono text-[#5e6ad2] mr-2">A:</span>
                    <input
                      type="text"
                      value={compareUrlA}
                      onChange={(e) => setCompareUrlA(e.target.value)}
                      placeholder="e.g. linear.app"
                      disabled={isLoading}
                      className="w-full h-9 bg-transparent text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none font-sans"
                    />
                  </div>

                  <div className="flex items-center px-2.5 bg-[#141516] border border-[#23252a] rounded-[6px]">
                    <span className="text-[11px] font-mono text-[#38bdf8] mr-2">B:</span>
                    <input
                      type="text"
                      value={compareUrlB}
                      onChange={(e) => setCompareUrlB(e.target.value)}
                      placeholder="e.g. jira.atlassian.com"
                      disabled={isLoading}
                      className="w-full h-9 bg-transparent text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading || !compareUrlA.trim() || !compareUrlB.trim()}
                  className="w-full text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Benchmarking Both Sites...</span>
                    </>
                  ) : (
                    <>
                      <Swords className="w-3.5 h-3.5 mr-1" />
                      <span>Compare Head-to-Head</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>

          {/* Dynamic Cybernetic Diagnostic Terminal (shown during scanning) */}
          {isLoading && (
            <LiveAuditScanner
              url={mode === "single" ? inputUrl : `${compareUrlA} vs ${compareUrlB}`}
              loadingStep={loadingStep}
              model={model}
            />
          )}

          {/* Presets */}
          {!isLoading && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#8a8f98]">
              <span className="mr-1">{mode === "single" ? "Sample audits:" : "Sample comparisons:"}</span>
              {mode === "single"
                ? SAMPLE_WEBSITES.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleSampleClick(s.url)}
                      className="px-2.5 py-1 rounded-[6px] bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#34343a] text-[#d0d6e0] hover:text-[#f7f8f8] transition flex items-center gap-1.5 text-[11px]"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-[#62666d] font-mono">{s.tag}</span>
                    </button>
                  ))
                : SAMPLE_COMPETITIVE_PAIRS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSamplePairClick(p)}
                      className="px-2.5 py-1 rounded-[6px] bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#34343a] text-[#d0d6e0] hover:text-[#f7f8f8] transition text-[11px] font-mono"
                    >
                      {p.name}
                    </button>
                  ))}
            </div>
          )}
        </div>

        {/* 4 Architectural Points */}
        <div className="mt-14 pt-6 border-t border-[#23252a] grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-2.5 rounded-[8px] bg-[#0f1011] border border-[#23252a]">
            <div className="text-xs font-semibold text-[#f7f8f8]">Sub-2s Latency</div>
            <div className="text-[11px] text-[#8a8f98] mt-0.5">Groq LPU hardware</div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0f1011] border border-[#23252a]">
            <div className="text-xs font-semibold text-[#f7f8f8]">AEO & GEO</div>
            <div className="text-[11px] text-[#8a8f98] mt-0.5">Generative AI search</div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0f1011] border border-[#23252a]">
            <div className="text-xs font-semibold text-[#f7f8f8]">7 Core Pillars</div>
            <div className="text-[11px] text-[#8a8f98] mt-0.5">Complete diagnostic</div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0f1011] border border-[#23252a]">
            <div className="text-xs font-semibold text-[#f7f8f8]">Dynamic Simulator</div>
            <div className="text-[11px] text-[#8a8f98] mt-0.5">Live score impact</div>
          </div>
        </div>
      </div>

      {/* Lead Capture Form Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
        targetUrl={pendingTargetUrl}
      />
    </section>
  );
}
