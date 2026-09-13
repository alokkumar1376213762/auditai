"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Globe, CheckCircle2, Download, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeadItem {
  id: string;
  name: string;
  email: string;
  targetUrl: string;
  subscribeAlerts: boolean;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.targetUrl.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "ID,Name,Email,Target URL,Alerts Opt-in,Timestamp\n";
    const rows = filtered
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.email}","${l.targetUrl}","${l.subscribeAlerts ? "Yes" : "No"}","${l.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#23252a]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-[6px] bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] text-[#8a8f98] hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs font-mono text-[#5e6ad2] uppercase">CRM & Lead Analytics</div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#f7f8f8] tracking-tight">
                Captured Website Audit Leads ({leads.length})
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLeads} className="text-xs">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={exportCSV} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 p-2 bg-[#0f1011] border border-[#23252a] rounded-[10px] max-w-md">
          <Search className="w-4 h-4 text-[#8a8f98] ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, gmail, or target website..."
            className="w-full bg-transparent text-xs text-white placeholder-[#62666d] focus:outline-none"
          />
        </div>

        {/* Leads Table */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141516] border-b border-[#23252a] text-[#8a8f98] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Visitor Name</th>
                  <th className="p-3.5">Gmail Address</th>
                  <th className="p-3.5">Website Audited</th>
                  <th className="p-3.5">Alerts Opt-In</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#8a8f98]">
                      {loading ? "Loading leads..." : "No leads found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-[#141516]/50 transition">
                      <td className="p-3.5 font-medium text-[#f7f8f8]">{l.name}</td>
                      <td className="p-3.5 text-[#38bdf8] font-mono">
                        <a href={`mailto:${l.email}`} className="hover:underline">
                          {l.email}
                        </a>
                      </td>
                      <td className="p-3.5 text-[#5e6ad2] font-mono">{l.targetUrl}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            l.subscribeAlerts
                              ? "bg-[#27a644]/10 border-[#27a644]/30 text-[#34d399]"
                              : "bg-[#18191a] border-[#23252a] text-[#8a8f98]"
                          }`}
                        >
                          {l.subscribeAlerts ? "Subscribed" : "Single View"}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#8a8f98] font-mono text-[11px]">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <a
                          href={`mailto:${l.email}?subject=Website%20Optimization%20Report%20for%20${encodeURIComponent(l.targetUrl)}`}
                          className="px-2.5 py-1 rounded-[5px] bg-[#18191a] border border-[#23252a] hover:border-[#5e6ad2] text-[#d0d6e0] hover:text-white transition text-[11px]"
                        >
                          Send Email
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions Card for Gmail Delivery */}
        <div className="p-4 rounded-[10px] bg-[#141516] border border-[#23252a] text-xs text-[#8a8f98] space-y-2">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Gmail Delivery Note for alokkumar13762@gmail.com</span>
          </div>
          <p className="leading-relaxed">
            Because emails are sent from your Gmail to your own Gmail, Google will automatically list them
            under <strong className="text-white">"Sent Mail"</strong> and <strong className="text-white">"All Mail"</strong> instead
            of your Primary Inbox (Google auto-archives emails you send to yourself). You can search for{" "}
            <code className="px-1 py-0.5 rounded bg-[#1f2125] text-white">from:alokkumar13762@gmail.com</code> in Gmail to see every lead!
          </p>
        </div>
      </div>
    </div>
  );
}
