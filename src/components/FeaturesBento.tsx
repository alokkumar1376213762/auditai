"use client";

import React from "react";
import { Zap, Search, Eye, BookOpen, DollarSign, ShieldCheck, Share } from "lucide-react";

export function FeaturesBento() {
  const pillars = [
    {
      icon: Zap,
      num: "01",
      title: "Performance & Technical Health",
      desc: "Measures TTFB server latency, Core Web Vitals (LCP, INP, CLS), script payload weight, and transport security.",
      tags: ["Core Web Vitals", "TTFB", "SSL / TLS"],
    },
    {
      icon: Search,
      num: "02",
      title: "SEO, AEO & Generative AI (GEO)",
      desc: "Evaluates organic indexability, Answer Engine Optimization (AEO), and citations in ChatGPT Search & Perplexity.",
      tags: ["JSON-LD", "AEO / GEO", "Meta & H1"],
    },
    {
      icon: Eye,
      num: "03",
      title: "UX, Visual Design & WCAG",
      desc: "Audits visual rhythm, navigation clarity, typographic hierarchy, and WCAG 2.1 accessibility compliance.",
      tags: ["WCAG 2.1", "Alt Coverage", "Hierarchy"],
    },
    {
      icon: BookOpen,
      num: "04",
      title: "Content Quality & Depth",
      desc: "Analyzes textual substance (~word count), audience relevance, tone consistency, and visual media integration.",
      tags: ["Text Depth", "Tone & Clarity"],
    },
    {
      icon: DollarSign,
      num: "05",
      title: "Conversion & Business Impact (CRO)",
      desc: "Evaluates Call-to-Action prominence, button contrast, conversion funnels, and bounce rate friction points.",
      tags: ["CTA Visibility", "Form Friction"],
    },
    {
      icon: ShieldCheck,
      num: "06",
      title: "Trust & Credibility",
      desc: "Verifies Privacy Policy, Terms of Service compliance, contact transparency, and security credentials.",
      tags: ["Privacy & Terms", "Transparency"],
    },
  ];

  return (
    <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 border-t border-[#23252a]">
      <div className="text-left mb-10">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#5e6ad2] mb-1">
          7-Pillar Commercial Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#f7f8f8]">
          Benchmark every dimension of modern web quality.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.num}
              className="p-5 rounded-[10px] bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-[6px] bg-[#141516] border border-[#23252a] text-[#828fff]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-[#62666d]">{p.num}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8] mt-3.5 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-xs text-[#8a8f98] mt-1.5 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#23252a] flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-[4px] bg-[#141516] text-[10px] font-mono text-[#8a8f98]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* 7th Wide Card */}
        <div className="md:col-span-2 lg:col-span-3 p-5 rounded-[10px] bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[6px] bg-[#141516] border border-[#23252a] text-[#828fff]">
                <Share className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-[#62666d]">07 / Engagement</span>
            </div>
            <h3 className="text-sm font-semibold text-[#f7f8f8] mt-2">
              Analytics, Engagement & Viral Social Share Cards
            </h3>
            <p className="text-xs text-[#8a8f98] mt-1 max-w-xl">
              Inspects OpenGraph preview tags (og:image, og:title), Twitter cards, and lead retention loops.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-[4px] bg-[#141516] text-[10px] font-mono text-[#d0d6e0] border border-[#23252a]">
              og:image 1200x630
            </span>
            <span className="px-2.5 py-1 rounded-[4px] bg-[#141516] text-[10px] font-mono text-[#d0d6e0] border border-[#23252a]">
              Twitter Cards
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
