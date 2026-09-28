"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Clock,
  Music,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Flame,
  Download,
  Filter,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { VocalRadarOverview } from "../dashboard/VocalRadarOverview";
import { mockPitchTrend, mockTempoTrend, mockAnalyticsData } from "@/lib/mockData";
import { useVocalStore } from "@/store/useVocalStore";

interface AnalyticsViewProps {
  analyticsData?: any;
}

const formantSpectrumData = [
  { freq: "500 Hz", energy: 42, label: "F1 (Vowel Pharynx)" },
  { freq: "1.0 kHz", energy: 58, label: "F2 (Oral Cavity)" },
  { freq: "1.5 kHz", energy: 50, label: "Mid Transition" },
  { freq: "2.0 kHz", energy: 65, label: "F3 (Laryngeal Ventricle)" },
  { freq: "2.5 kHz", energy: 84, label: "Singer's Formant (Ring)" },
  { freq: "2.8 kHz", energy: 96, label: "Peak Acoustic Ring" },
  { freq: "3.2 kHz", energy: 78, label: "Upper Formant" },
  { freq: "4.0 kHz", energy: 45, label: "High Brilliance" },
  { freq: "5.0 kHz", energy: 30, label: "Air Chiff" },
];

const vibratoTrackingData = [
  { session: "Sess #76", rate: 5.4, depth: 45, date: "Sep 14" },
  { session: "Sess #77", rate: 5.6, depth: 48, date: "Sep 16" },
  { session: "Sess #78", rate: 5.7, depth: 50, date: "Sep 18" },
  { session: "Sess #79", rate: 5.65, depth: 49, date: "Sep 20" },
  { session: "Sess #80", rate: 5.8, depth: 52, date: "Sep 22" },
  { session: "Sess #81", rate: 5.75, depth: 51, date: "Sep 24" },
  { session: "Sess #82", rate: 5.85, depth: 52, date: "Sep 26" },
  { session: "Sess #84", rate: 5.82, depth: 52, date: "Sep 28" },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsData }) => {
  const { showNotification } = useVocalStore();
  const [timeFilter, setTimeFilter] = useState<"14D" | "30D" | "90D" | "ALL">("30D");
  const [activeTab, setActiveTab] = useState<"intonation" | "formants" | "vibrato">("intonation");

  const weeklyDistribution = analyticsData?.weeklyDistribution || mockAnalyticsData.weeklyDistribution;

  const handleExport = () => {
    showNotification("Generating high-resolution vocal analytics report...", "info");
    setTimeout(() => {
      showNotification("Report generated & downloaded: vocalytics_analytics.pdf", "success");
    }, 900);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300">
              <TrendingUp className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Practice Analytics & Acoustic Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Empirical DSP measurements of intonation drift, acoustic formant resonance, and vibrato stability.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
            {(["14D", "30D", "90D", "ALL"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  timeFilter === range
                    ? "bg-neon-cyan text-slate-950 font-bold shadow-glow-cyan"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-4 backdrop-blur-xl shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intonation Drift Reduction
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-400 font-mono">-64% Error</div>
          <p className="mt-1 text-[11px] text-slate-400">From 15.4 to 5.4 cents average deviation</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-4 backdrop-blur-xl shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Range Extension
          </span>
          <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">+2 Semitones</div>
          <p className="mt-1 text-[11px] text-slate-400">Head tessitura established through A5</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-4 backdrop-blur-xl shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Singer&apos;s Formant Ring
          </span>
          <div className="mt-1 text-2xl font-black text-brand-300 font-mono">2.85 kHz</div>
          <p className="mt-1 text-[11px] text-slate-400">94.8% acoustic harmonic energy concentration</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-4 backdrop-blur-xl shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vibrato Window
          </span>
          <div className="mt-1 text-2xl font-black text-amber-400 font-mono">5.82 Hz Pocket</div>
          <p className="mt-1 text-[11px] text-slate-400">Zero involuntary oscillation wobble</p>
        </div>
      </div>

      {/* Analytics Visualization Tabs (Intonation vs Formants vs Vibrato) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-2">
            {[
              { id: "intonation", label: "Longitudinal Intonation Curve" },
              { id: "formants", label: "Singer's Formant Spectrum (FFT)" },
              { id: "vibrato", label: "Vibrato Frequency & Depth" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white font-bold shadow-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Algorithm: Librosa YIN + Spectral Centroid
          </span>
        </div>

        {/* Tab 1: Intonation Curve */}
        {activeTab === "intonation" && (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPitchTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/[0.12] bg-[#090d16]/95 p-3 shadow-2xl backdrop-blur-2xl text-xs">
                          <div className="font-bold text-white">{item.sessionTitle}</div>
                          <div className="mt-1 text-neon-cyan font-mono font-bold">Accuracy: {item.accuracy}%</div>
                          <div className="text-slate-400 font-mono">Drift: &plusmn;{item.centsError} cents</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={90} stroke="#818cf8" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2.5} fill="url(#intGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Formant Spectrum */}
        {activeTab === "formants" && (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formantSpectrumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="formantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="freq" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/[0.12] bg-[#090d16]/95 p-3 shadow-2xl backdrop-blur-2xl text-xs">
                          <div className="font-bold text-white">{item.label}</div>
                          <div className="mt-1 text-indigo-300 font-mono font-bold">Acoustic Energy: {item.energy}%</div>
                          <div className="text-slate-400 font-mono">Frequency: {item.freq}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="energy" fill="url(#formantGrad)" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Vibrato Rate & Depth */}
        {activeTab === "vibrato" && (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vibratoTrackingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[5.0, 6.5]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} Hz`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/[0.12] bg-[#090d16]/95 p-3 shadow-2xl backdrop-blur-2xl text-xs">
                          <div className="font-bold text-white">{item.session}</div>
                          <div className="mt-1 text-amber-300 font-mono font-bold">Vibrato Rate: {item.rate} Hz</div>
                          <div className="text-slate-400 font-mono">Depth: &plusmn;{item.depth} cents</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceArea y1={5.5} y2={6.2} fill="rgba(245, 158, 11, 0.08)" />
                <ReferenceLine y={5.8} stroke="#f59e0b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 6-Axis Geometry Radar */}
      <VocalRadarOverview
        radarMetrics={analyticsData?.radarMetrics}
        progressTimeline={analyticsData?.progressTimeline}
      />
    </div>
  );
};
