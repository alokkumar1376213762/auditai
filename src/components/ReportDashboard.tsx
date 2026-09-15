"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Printer,
  Share2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Search,
  Zap,
  Eye,
  TrendingUp,
  FileCode,
  Check,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  DollarSign,
  Share,
  Download,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  CheckSquare,
  Square,
  Code2,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WebsiteAuditReport, ActionItem, ComprehensivePillar } from "@/types/audit";
import { ScoreGauge } from "@/components/ScoreGauge";
import { PillarsRadarChart } from "@/components/PillarsRadarChart";
import { generateFixCodeSnippet } from "@/lib/codeSnippets";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { soundManager } from "@/lib/sound";

interface ReportDashboardProps {
  report: WebsiteAuditReport;
  onReset: () => void;
}

export function ReportDashboard({ report, onReset }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "perf" | "seo" | "ux" | "content" | "cro" | "trust" | "preview" | "actions" | "raw"
  >("overview");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Interactive Fix Simulator State
  const [fixedItemIds, setFixedItemIds] = useState<Record<string, boolean>>({});
  const [showSnippetIds, setShowSnippetIds] = useState<Record<string, boolean>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 350);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSnippet = (id: string) => {
    setShowSnippetIds((prev) => ({ ...prev, [id]: !prev[id] }));
    soundManager.playPop();
  };

  const copySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    soundManager.playPop();
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Calculate dynamic simulated score based on checked fixes
  const calculateSimulatedScore = () => {
    let bonus = 0;
    report.actionItems.forEach((item, idx) => {
      const id = item.id || `action-${idx}`;
      if (fixedItemIds[id]) {
        if (item.priority === "CRITICAL") bonus += 6;
        else if (item.priority === "HIGH") bonus += 4;
        else if (item.priority === "MEDIUM") bonus += 2;
        else bonus += 1;
      }
    });
    return Math.min(100, report.overallScore + bonus);
  };

  const simulatedScore = calculateSimulatedScore();
  const pointsGained = simulatedScore - report.overallScore;

  const toggleFixItem = (id: string) => {
    setFixedItemIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      soundManager.playPop();
      return next;
    });
  };

  useEffect(() => {
    if (pointsGained >= 10 || simulatedScore >= 90) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#5e6ad2", "#27a644", "#38bdf8"],
        });
        soundManager.playSuccess();
      } catch (e) {}
    }
  }, [pointsGained, simulatedScore]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playPop();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    soundManager.playPop();
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    soundManager.playPop();
    const md = `# AuditAI Report for ${report.url}
**Overall Score:** ${report.overallScore}/100 (Grade ${report.grade})
**Audited At:** ${new Date(report.analyzedAt).toLocaleString()}
**Engine:** ${report.usedAiModel}

## Executive Summary
${report.summary}

## 7 Core Pillars
- **Performance & Technical:** ${report.pillars.performance.score}/100 (${report.pillars.performance.status})
- **SEO, AEO & GEO:** ${report.pillars.seoAndAeo.score}/100 (${report.pillars.seoAndAeo.status})
- **UX & Visual Design:** ${report.pillars.uxAndDesign.score}/100 (${report.pillars.uxAndDesign.status})
- **Content Quality:** ${report.pillars.contentQuality.score}/100 (${report.pillars.contentQuality.status})
- **Conversion (CRO):** ${report.pillars.conversion.score}/100 (${report.pillars.conversion.status})
- **Trust & Credibility:** ${report.pillars.trustAndCredibility.score}/100 (${report.pillars.trustAndCredibility.status})
- **Analytics & Engagement:** ${report.pillars.analyticsAndEngagement.score}/100 (${report.pillars.analyticsAndEngagement.status})

## Action Plan Recommendations
${report.actionItems
  .map(
    (a, i) =>
      `${i + 1}. [${a.priority}] ${a.title}\n   - Effort: ${a.estimatedEffort}\n   - Impact: ${a.impact}\n   - Description: ${a.description}`
  )
  .join("\n\n")}
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${report.url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToGmail = async () => {
    setIsSendingEmail(true);
    setEmailStatusMessage(null);
    soundManager.playPop();

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver report to Gmail.");
      }
      setEmailStatusMessage(`✓ Full report delivered directly to ${data.deliveredTo}!`);
      soundManager.playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 },
          colors: ["#5e6ad2", "#27a644", "#38bdf8"],
        });
      } catch (e) {}
      setTimeout(() => setEmailStatusMessage(null), 5000);
    } catch (err: any) {
      setEmailStatusMessage(err.message || "Failed to send");
      setTimeout(() => setEmailStatusMessage(null), 4000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredActions = report.actionItems.filter((item) => {
    const matchesPriority =
      actionFilter === "ALL" || item.priority === actionFilter || item.category === actionFilter;
    const matchesQuery =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesQuery;
  });

  const getPriorityBadge = (priority: ActionItem["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>;
      case "HIGH":
        return <Badge variant="warning">High Priority</Badge>;
      case "MEDIUM":
        return <Badge variant="linear">Medium</Badge>;
      case "LOW":
        return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  const pillarEntries: { key: keyof WebsiteAuditReport["pillars"]; icon: any; title: string }[] = [
    { key: "performance", icon: Zap, title: "Performance" },
    { key: "seoAndAeo", icon: Search, title: "SEO, AEO & GEO" },
    { key: "uxAndDesign", icon: Eye, title: "UX & Design" },
    { key: "contentQuality", icon: BookOpen, title: "Content Quality" },
    { key: "conversion", icon: DollarSign, title: "Conversion (CRO)" },
    { key: "trustAndCredibility", icon: ShieldCheck, title: "Trust & Security" },
    { key: "analyticsAndEngagement", icon: Share, title: "Analytics & Social" },
  ];

  const renderPillarDetails = (pillar: ComprehensivePillar) => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[12px] bg-[#0f1011] border border-[#23252a]">
        <div>
          <Badge variant={pillar.score >= 80 ? "success" : pillar.score >= 60 ? "warning" : "destructive"}>
            {pillar.status} ({pillar.score}/100)
          </Badge>
          <h3 className="text-lg font-semibold text-[#f7f8f8] mt-2">{pillar.title}</h3>
          <p className="text-xs text-[#8a8f98] mt-1 max-w-xl">{pillar.summary}</p>
        </div>
        <div className="shrink-0">
          <ScoreGauge score={pillar.score} grade={pillar.score >= 85 ? "A" : pillar.score >= 70 ? "B" : "C"} size="md" label="" />
        </div>
      </div>

      {/* Sub-item breakdowns */}
      {pillar.subItems && pillar.subItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pillar.subItems.map((sub, i) => (
            <div key={i} className="p-3.5 rounded-[8px] bg-[#141516] border border-[#23252a] flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-[#f7f8f8]">{sub.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    sub.status === "Passed"
                      ? "bg-[#27a644]/10 border-[#27a644]/30 text-[#34d399]"
                      : sub.status === "Warning"
                      ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fbbf24]"
                      : "bg-[#eb5757]/10 border-[#eb5757]/30 text-[#f87171]"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-[11px] text-[#8a8f98]">{sub.detail}</p>
              <div className="w-full bg-[#18191a] h-1.5 rounded-full overflow-hidden border border-[#23252a]">
                <div
                  className="bg-[#5e6ad2] h-full rounded-full transition-all duration-500"
                  style={{ width: `${sub.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-[8px] bg-[#0f1011] border border-[#23252a] space-y-2">
          <span className="text-[11px] font-mono font-medium text-[#27a644] uppercase tracking-wider">
            Passed Benchmarks
          </span>
          {pillar.pros.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#d0d6e0]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27a644] shrink-0 mt-0.5" />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-[8px] bg-[#0f1011] border border-[#23252a] space-y-2">
          <span className="text-[11px] font-mono font-medium text-[#f59e0b] uppercase tracking-wider">
            Optimization Opportunities
          </span>
          {pillar.cons.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#d0d6e0]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in duration-200 relative">
      {/* Floating Dynamic Sticky Navigation Dock */}
      {showStickyBar && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 bg-[#0f1011]/90 backdrop-blur-md border border-[#23252a] px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-200 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5e6ad2] animate-pulse" />
            <span className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-[190px]">
              {report.url.replace(/^https?:\/\//, "")}
            </span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[#23252a]">
            <span className="text-[11px] font-mono text-[#8a8f98]">Score:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2]/40 text-[#828fff] text-xs font-bold font-mono">
              {simulatedScore}/100
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-[#23252a] text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-2 py-1 rounded-[4px] text-[11px] transition ${
                activeTab === "overview" ? "text-white bg-[#18191a]" : "text-[#8a8f98] hover:text-white"
              }`}
            >
              Radar & Pillars
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-2 py-1 rounded-[4px] text-[11px] transition ${
                activeTab === "actions" ? "text-white bg-[#18191a]" : "text-[#8a8f98] hover:text-white"
              }`}
            >
              Fixes ({report.actionItems.length})
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2 py-1 rounded-[4px] text-[11px] transition ${
                activeTab === "preview" ? "text-white bg-[#18191a]" : "text-[#8a8f98] hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleDownloadMarkdown} className="text-[11px] h-7 px-2.5">
            Export .MD
          </Button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#23252a]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8a8f98] font-mono">
            <span className="text-[#5e6ad2]">Audit Complete</span>
            <span>•</span>
            <span>{report.usedAiModel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#f7f8f8] flex items-center gap-2 mt-1 tracking-tight">
            <span>Report for</span>
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e6ad2] hover:underline inline-flex items-center gap-1"
            >
              {report.url.replace(/^https?:\/\//, "")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </h2>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto no-print">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-[6px] border text-xs transition flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-[#5e6ad2]/15 border-[#5e6ad2]/40 text-[#828fff]"
                : "bg-[#0f1011] border-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8]"
            }`}
            title={soundEnabled ? "Audio FX Active" : "Enable Audio Feedback"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <Button variant="outline" size="sm" onClick={onReset} className="text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            New Audit
          </Button>

          <Button variant="secondary" size="sm" onClick={handleShare} className="text-xs">
            {copiedUrl ? <Check className="w-3 h-3 mr-1 text-[#27a644]" /> : <Share2 className="w-3 h-3 mr-1" />}
            {copiedUrl ? "Copied" : "Share"}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleDownloadMarkdown} className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            .MD
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSendToGmail}
            disabled={isSendingEmail}
            className="text-xs bg-[#5e6ad2] hover:bg-[#4d5ac4] text-white shadow-sm"
            title="Email complete report directly to your Gmail"
          >
            <Mail className={`w-3 h-3 mr-1 ${isSendingEmail ? "animate-spin" : ""}`} />
            {isSendingEmail ? "Sending..." : "Email to Gmail"}
          </Button>

          <Button variant="secondary" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Email Delivery Notification Banner */}
      {emailStatusMessage && (
        <div className="mt-4 p-3 rounded-[8px] bg-[#27a644]/15 border border-[#27a644]/40 text-[#34d399] text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#27a644]" />
            <span>{emailStatusMessage}</span>
          </div>
          <button
            onClick={() => setEmailStatusMessage(null)}
            className="text-[11px] text-[#8a8f98] hover:text-white transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Interactive Fix Simulator Banner */}
      {pointsGained > 0 && (
        <div className="mt-4 p-3.5 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#828fff]" />
            <div className="text-xs text-[#f7f8f8]">
              <span className="font-semibold text-white">Dynamic Score Simulator:</span>{" "}
              {Object.values(fixedItemIds).filter(Boolean).length} fixes marked completed.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8a8f98]">
              Baseline: {report.overallScore} →{" "}
            </span>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#27a644]/20 border border-[#27a644]/40 text-[#34d399] font-mono text-xs font-bold">
              Simulated: {simulatedScore} (+{pointsGained} pts)
            </span>
          </div>
        </div>
      )}

      {/* Composite Score Card (Linear panel) */}
      <div className="mt-6 rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6 sm:p-7">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex justify-center border-b md:border-b-0 md:border-r border-[#23252a] pb-6 md:pb-0 md:pr-6">
            <ScoreGauge
              score={simulatedScore}
              grade={simulatedScore >= 90 ? "A+" : simulatedScore >= 85 ? "A" : simulatedScore >= 70 ? "B" : "C"}
              size="lg"
              label={pointsGained > 0 ? "Simulated Score" : "Overall Score"}
            />
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="linear">7-Pillar Commercial Report</Badge>
              <Badge variant={simulatedScore >= 80 ? "success" : "warning"}>
                {simulatedScore >= 80 ? "Production Grade" : "Needs Optimization"}
              </Badge>
              {pointsGained > 0 && (
                <Badge variant="success">+{pointsGained} pts from simulator</Badge>
              )}
            </div>

            <p className="text-sm text-[#d0d6e0] leading-relaxed">
              {report.summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-[6px] bg-[#141516] border border-[#23252a]">
                <span className="text-[10px] text-[#8a8f98] font-mono uppercase block">TTFB Latency</span>
                <span className="text-sm font-semibold text-[#f7f8f8] font-mono mt-0.5 block">
                  {report.scrapedSignals.responseTimeMs}ms
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#141516] border border-[#23252a]">
                <span className="text-[10px] text-[#8a8f98] font-mono uppercase block">AEO & GEO</span>
                <span className={`text-sm font-semibold mt-0.5 block ${report.scrapedSignals.hasSchemaJsonLd ? "text-[#27a644]" : "text-[#f59e0b]"}`}>
                  {report.scrapedSignals.hasSchemaJsonLd ? "JSON-LD Active" : "No Schema"}
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#141516] border border-[#23252a]">
                <span className="text-[10px] text-[#8a8f98] font-mono uppercase block">Privacy & Trust</span>
                <span className={`text-sm font-semibold mt-0.5 block ${report.scrapedSignals.hasPrivacyPolicy ? "text-[#27a644]" : "text-[#f59e0b]"}`}>
                  {report.scrapedSignals.hasPrivacyPolicy ? "Compliant" : "Missing Policy"}
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#141516] border border-[#23252a]">
                <span className="text-[10px] text-[#8a8f98] font-mono uppercase block">Action Items</span>
                <span className="text-sm font-semibold text-[#5e6ad2] mt-0.5 block">
                  {report.actionItems.length} Priorities
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex items-center gap-1.5 border-b border-[#23252a] overflow-x-auto pb-1 no-print text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "overview"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          All 7 Pillars
        </button>

        <button
          onClick={() => setActiveTab("actions")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "actions"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span>Interactive Action Plan ({report.actionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "preview"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Live Device Frame</span>
        </button>

        <button
          onClick={() => setActiveTab("perf")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "perf"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          Speed & Technical
        </button>

        <button
          onClick={() => setActiveTab("seo")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "seo"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          SEO & AEO
        </button>

        <button
          onClick={() => setActiveTab("ux")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "ux"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          UX & Design
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "content"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          Content
        </button>

        <button
          onClick={() => setActiveTab("cro")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "cro"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          Conversion
        </button>

        <button
          onClick={() => setActiveTab("trust")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "trust"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          Trust
        </button>

        <button
          onClick={() => setActiveTab("raw")}
          className={`px-3 py-1.5 rounded-[6px] transition shrink-0 ${
            activeTab === "raw"
              ? "bg-[#141516] text-[#f7f8f8] border border-[#34343a] font-medium"
              : "text-[#8a8f98] hover:text-[#f7f8f8]"
          }`}
        >
          Raw DOM
        </button>
      </div>

      {/* Tab: All 7 Pillars Grid */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-6">
          {/* Radar Chart & High-Level Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6 flex justify-center">
              <PillarsRadarChart pillars={report.pillars} />
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between gap-3">
              <div className="p-4 rounded-[10px] bg-[#0f1011] border border-[#23252a] space-y-2 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#27a644]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Primary Architecture Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#d0d6e0]">
                  {report.topStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#27a644] font-mono">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[10px] bg-[#0f1011] border border-[#23252a] space-y-2 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#5e6ad2]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Immediate Quick Wins</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#d0d6e0]">
                  {report.quickWins.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#5e6ad2] font-mono">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pillarEntries.map(({ key, icon: Icon, title }) => {
              const p = report.pillars[key];
              if (!p) return null;

              return (
                <div
                  key={key}
                  className="rounded-[10px] bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] p-4 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-[5px] bg-[#141516] border border-[#23252a] text-[#828fff]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-[#f7f8f8]">{title}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-[#f7f8f8]">{p.score}/100</span>
                    </div>
                    <p className="text-[11px] text-[#8a8f98] mt-2.5 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#23252a] space-y-2">
                    <div className="w-full bg-[#141516] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5e6ad2] h-full rounded-full"
                        style={{ width: `${p.score}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#8a8f98] line-clamp-1">
                      {p.pros[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Device Frame Preview Tab */}
      {activeTab === "preview" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#0f1011] border border-[#23252a]">
            <div className="text-xs text-[#8a8f98]">
              Live iframe viewport for: <span className="text-white font-mono">{report.url}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded-[5px] text-xs flex items-center gap-1 transition ${
                  previewMode === "desktop"
                    ? "bg-[#5e6ad2] text-white"
                    : "bg-[#141516] text-[#8a8f98] hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded-[5px] text-xs flex items-center gap-1 transition ${
                  previewMode === "mobile"
                    ? "bg-[#5e6ad2] text-white"
                    : "bg-[#141516] text-[#8a8f98] hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center p-4 rounded-[12px] bg-[#050608] border border-[#23252a]">
            <div
              className={`transition-all duration-300 rounded-[8px] overflow-hidden border border-[#23252a] bg-black ${
                previewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-[550px]"
              }`}
            >
              <iframe
                src={report.url}
                title="Website Live View"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Plan with Fix Simulator */}
      {activeTab === "actions" && (
        <div className="mt-6 space-y-4">
          {/* Dynamic Search & Priority Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[#8a8f98] mr-1">Filter priority:</span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                <button
                  key={level}
                  onClick={() => setActionFilter(level)}
                  className={`px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition ${
                    actionFilter === level
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#141516] text-[#8a8f98] hover:text-[#f7f8f8]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8a8f98] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action items..."
                className="h-8 pl-8 pr-3 text-xs bg-[#141516] border border-[#23252a] rounded-[6px] text-white placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] font-sans w-full sm:w-56"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredActions.map((action, idx) => {
              const id = action.id || `action-${idx}`;
              const isFixed = Boolean(fixedItemIds[id]);

              return (
                <div
                  key={id}
                  className={`p-4 rounded-[10px] border transition-all ${
                    isFixed
                      ? "border-[#27a644]/40 bg-[#27a644]/5"
                      : "border-[#23252a] bg-[#0f1011] hover:border-[#34343a]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFixItem(id)}
                        className="text-[#8a8f98] hover:text-white transition flex items-center gap-1 text-xs"
                      >
                        {isFixed ? (
                          <CheckSquare className="w-4 h-4 text-[#27a644]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      {getPriorityBadge(action.priority)}
                      <span className="text-[11px] font-mono text-[#8a8f98]">{action.category}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8a8f98] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {action.estimatedEffort}
                      </span>
                      {isFixed && (
                        <span className="text-[#27a644] font-bold">
                          +{action.priority === "CRITICAL" ? "6" : action.priority === "HIGH" ? "4" : "2"} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <h4
                    className={`text-sm font-medium mt-2 transition ${
                      isFixed ? "line-through text-[#8a8f98]" : "text-[#f7f8f8]"
                    }`}
                  >
                    {action.title}
                  </h4>
                  <p className="text-xs text-[#8a8f98] mt-1 leading-relaxed">{action.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-[#23252a] text-[11px] text-[#27a644] flex items-center justify-between">
                    <span>Impact: {action.impact}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSnippet(id)}
                        className="text-[11px] text-[#8a8f98] hover:text-white transition flex items-center gap-1 font-mono"
                      >
                        <Code2 className="w-3 h-3 text-[#5e6ad2]" />
                        <span>{showSnippetIds[id] ? "Hide Code Fix" : "View Code Fix"}</span>
                        {showSnippetIds[id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => toggleFixItem(id)}
                        className="text-[11px] text-[#5e6ad2] hover:underline"
                      >
                        {isFixed ? "Mark as Unfixed" : "Simulate Fix"}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Code Fix Snippet */}
                  {showSnippetIds[id] && (() => {
                    const snippet = generateFixCodeSnippet(action, report.url);
                    const isCopied = copiedSnippetId === id;
                    return (
                      <div className="mt-3 p-3 rounded-[8px] bg-[#070809] border border-[#23252a] font-mono text-[11px] space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[#8a8f98] pb-1.5 border-b border-[#1c1d20]">
                          <span className="text-[#828fff] flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {snippet.filename}
                          </span>
                          <button
                            type="button"
                            onClick={() => copySnippet(id, snippet.code)}
                            className="text-[#d0d6e0] hover:text-white transition flex items-center gap-1 px-2 py-0.5 rounded bg-[#141516] border border-[#23252a]"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                          </button>
                        </div>
                        <pre className="text-[#f7f8f8] overflow-x-auto p-1 leading-relaxed whitespace-pre-wrap">
                          {snippet.code}
                        </pre>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Pillar Views */}
      {activeTab === "perf" && renderPillarDetails(report.pillars.performance)}
      {activeTab === "seo" && renderPillarDetails(report.pillars.seoAndAeo)}
      {activeTab === "ux" && renderPillarDetails(report.pillars.uxAndDesign)}
      {activeTab === "content" && renderPillarDetails(report.pillars.contentQuality)}
      {activeTab === "cro" && renderPillarDetails(report.pillars.conversion)}
      {activeTab === "trust" && renderPillarDetails(report.pillars.trustAndCredibility)}

      {/* Raw DOM Inspector */}
      {activeTab === "raw" && (
        <div className="mt-6 p-5 rounded-[10px] border border-[#23252a] bg-[#0f1011] font-mono text-xs text-[#8a8f98] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
            <span className="text-[#5e6ad2] font-semibold">Parsed DOM Metadata</span>
            <span>Live Scan</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>Title: <span className="text-[#f7f8f8]">"{report.scrapedSignals.title}"</span></div>
            <div>Description: <span className="text-[#d0d6e0]">"{report.scrapedSignals.description}"</span></div>
            <div>Schema JSON-LD: <span className={report.scrapedSignals.hasSchemaJsonLd ? "text-[#27a644]" : "text-[#f59e0b]"}>{report.scrapedSignals.hasSchemaJsonLd ? "Found" : "Missing"}</span></div>
            <div>Privacy Policy: <span className={report.scrapedSignals.hasPrivacyPolicy ? "text-[#27a644]" : "text-[#eb5757]"}>{report.scrapedSignals.hasPrivacyPolicy ? "Found" : "Missing"}</span></div>
            <div>Terms of Service: <span className={report.scrapedSignals.hasTermsOfService ? "text-[#27a644]" : "text-[#eb5757]"}>{report.scrapedSignals.hasTermsOfService ? "Found" : "Missing"}</span></div>
            <div>H1 Headings: <span className="text-[#f7f8f8]">{report.scrapedSignals.headings.h1.join(" | ") || "None"}</span></div>
            <div>Images Total / Missing Alt: <span className="text-[#f7f8f8]">{report.scrapedSignals.images.total} / {report.scrapedSignals.images.missingAlt}</span></div>
          </div>
        </div>
      )}
    </section>
  );
}
