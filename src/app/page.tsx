"use client";

import React, { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesBento } from "@/components/FeaturesBento";
import { ReportDashboard } from "@/components/ReportDashboard";
import { CompareDashboard } from "@/components/CompareDashboard";
import { Footer } from "@/components/Footer";
import { MouseGlowEffect } from "@/components/MouseGlowEffect";
import { WebsiteAuditReport } from "@/types/audit";
import { AlertCircle, X } from "lucide-react";

export default function Home() {
  const [report, setReport] = useState<WebsiteAuditReport | null>(null);
  const [compareReports, setCompareReports] = useState<{
    a: WebsiteAuditReport;
    b: WebsiteAuditReport;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const model = "groq/compound";

  const reportRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (targetUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCompareReports(null);
    setLoadingStep("Connecting to target server and extracting DOM elements...");

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep("Parsing headings, SEO meta tags, images and script payloads...");
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep("Groq LPU neural inference in progress...");
      }, 2500);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze website.");
      }

      setReport(data);

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred while analyzing the website.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (urlA: string, urlB: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);
    setLoadingStep(`Benchmarking ${urlA} and ${urlB} head-to-head...`);

    try {
      const fetchSite = async (u: string) => {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: u }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || `Failed to analyze ${u}`);
        return d;
      };

      const [resA, resB] = await Promise.all([fetchSite(urlA), fetchSite(urlB)]);

      setCompareReports({ a: resA, b: resB });

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred during competitive analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setCompareReports(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2] selection:text-white relative">
      {/* Interactive Ambient Mouse Glow */}
      <MouseGlowEffect />

      {/* Navigation */}
      <Navbar
        onOpenKeyModal={() => {}}
        hasApiKey={true}
        selectedModel={model}
      />

      {/* Error Alert Notification */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-[10px] bg-[#eb5757]/10 border border-[#eb5757]/30 text-[#f87171] flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#eb5757] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Audit Error</h4>
                <p className="text-xs text-[#fca5a5] mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-md hover:bg-[#eb5757]/20 text-[#f87171] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection
          onAnalyze={handleAnalyze}
          onCompare={handleCompare}
          isLoading={isLoading}
          loadingStep={loadingStep}
          model={model}
        />

        {/* Content Section: Compare Dashboard, Single Report, or Bento */}
        <div ref={reportRef}>
          {compareReports ? (
            <CompareDashboard
              reportA={compareReports.a}
              reportB={compareReports.b}
              onReset={handleReset}
            />
          ) : report ? (
            <ReportDashboard report={report} onReset={handleReset} />
          ) : (
            <FeaturesBento />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
