"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, User, CheckSquare, Square, Sparkles, ArrowRight, ShieldCheck, BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { soundManager } from "@/lib/sound";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; subscribeAlerts: boolean }) => void;
  targetUrl: string;
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  targetUrl,
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribeAlerts, setSubscribeAlerts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate saved credentials if user previously submitted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLead = localStorage.getItem("auditai_lead_info");
      if (savedLead) {
        try {
          const parsed = JSON.parse(savedLead);
          if (parsed.name) setName(parsed.name);
          if (parsed.email) setEmail(parsed.email);
          if (typeof parsed.subscribeAlerts === "boolean") setSubscribeAlerts(parsed.subscribeAlerts);
        } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your Gmail address.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@gmail.com).");
      return;
    }

    setIsSubmitting(true);
    soundManager.playPop();

    try {
      // Save locally
      localStorage.setItem(
        "auditai_lead_info",
        JSON.stringify({ name: name.trim(), email: email.trim(), subscribeAlerts })
      );

      // Send lead to server
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          targetUrl,
          subscribeAlerts,
        }),
      });
    } catch (err) {
      console.warn("Lead save notice:", err);
    } finally {
      setIsSubmitting(false);
      onSubmit({ name: name.trim(), email: email.trim(), subscribeAlerts });
    }
  };

  const handleSkip = () => {
    soundManager.playPop();
    onSubmit({ name: name.trim() || "Anonymous", email: email.trim(), subscribeAlerts: false });
  };

  const cleanDomain = targetUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[14px] bg-[#0c0d0e] border border-[#23252a] p-6 shadow-2xl shadow-black/80 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[6px] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#18191a] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Domain Pill */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-[8px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 text-[#828fff]">
            <BellRing className="w-4 h-4" />
          </div>
          {cleanDomain && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#141516] border border-[#23252a] text-[#8a8f98] font-mono text-[11px] truncate max-w-[240px]">
              Target: <span className="text-[#f7f8f8]">{cleanDomain}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#f7f8f8]">
          Receive Website Improvement Reports
        </h3>
        <p className="mt-1 text-xs text-[#8a8f98] leading-relaxed">
          Get real-time Core Web Vitals diagnostics, AEO ranking updates, and prioritized fix roadmaps
          delivered directly to your inbox.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {/* Name Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] mb-1.5">
              Your Name
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-[#62666d] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#141516] border border-[#23252a] rounded-[8px] text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] transition font-sans"
              />
            </div>
          </div>

          {/* Gmail Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] mb-1.5">
              Gmail Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-[#62666d] absolute left-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@gmail.com"
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#141516] border border-[#23252a] rounded-[8px] text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] transition font-sans"
              />
            </div>
          </div>

          {/* Checkbox Tick Field */}
          <div
            onClick={() => setSubscribeAlerts(!subscribeAlerts)}
            className="p-3 rounded-[8px] bg-[#141516] border border-[#23252a] hover:border-[#34343a] cursor-pointer transition flex items-start gap-2.5 select-none"
          >
            <div className="pt-0.5 shrink-0 text-[#5e6ad2]">
              {subscribeAlerts ? (
                <CheckSquare className="w-4 h-4 text-[#5e6ad2]" />
              ) : (
                <Square className="w-4 h-4 text-[#62666d]" />
              )}
            </div>
            <div className="text-xs text-[#d0d6e0] leading-snug">
              <span>Send me improvement alerts & action items for this website on my Gmail</span>
              <span className="block text-[10px] text-[#8a8f98] mt-0.5">
                Weekly SEO health, broken links, and speed regression notices. Unsubscribe anytime.
              </span>
            </div>
          </div>

          {/* Validation Error */}
          {error && (
            <div className="text-[11px] text-[#f87171] bg-[#eb5757]/10 border border-[#eb5757]/30 p-2 rounded-[6px]">
              {error}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full text-xs"
            >
              <span>{isSubmitting ? "Starting Audit..." : "Continue to Audit Website"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="text-[11px] text-[#8a8f98] hover:text-[#d0d6e0] transition py-1 text-center font-mono"
            >
              Skip and continue without email alerts
            </button>
          </div>
        </form>

        {/* Privacy Note */}
        <div className="mt-4 pt-3 border-t border-[#1e2024] flex items-center justify-center gap-1.5 text-[10px] text-[#62666d]">
          <ShieldCheck className="w-3 h-3 text-[#27a644]" />
          <span>Zero spam guarantee • Your data is private & never sold</span>
        </div>
      </div>
    </div>
  );
}
