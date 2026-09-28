"use client";

import React from "react";
import {
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Clock,
  Music,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { VocalRadarOverview } from "../dashboard/VocalRadarOverview";

interface AnalyticsViewProps {
  analyticsData?: any;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsData }) => {
  const kpis = analyticsData?.kpis || {};
  const weeklyDistribution = analyticsData?.weeklyDistribution || [
    { day: "Sun", minutes: 35, sessions: 1 },
    { day: "Mon", minutes: 50, sessions: 2 },
    { day: "Tue", minutes: 40, sessions: 1 },
    { day: "Wed", minutes: 65, sessions: 2 },
    { day: "Thu", minutes: 75, sessions: 2 },
    { day: "Fri", minutes: 90, sessions: 3 },
    { day: "Sat", minutes: 140, sessions: 3 },
  ];

  const maxMinutes = Math.max(...weeklyDistribution.map((d: any) => d.minutes), 60);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
            <TrendingUp className="h-4 w-4 text-neon-cyan" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Vocal Mastery & Longitudinal Analytics
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Empirical measurements of intonation drift, pitch accuracy, vibrato stabilization, and vocal range expansion over time.
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intonation Drift Reduction
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-400 font-mono">-42% Error</div>
          <p className="mt-1 text-[11px] text-slate-400">From 16.2 to 9.4 cents deviation</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Range Expansion
          </span>
          <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">+2 Semitones</div>
          <p className="mt-1 text-[11px] text-slate-400">Upper limit moved from G4 to A4</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vibrato Window
          </span>
          <div className="mt-1 text-2xl font-black text-brand-400 font-mono">5.7 Hz Pocket</div>
          <p className="mt-1 text-[11px] text-slate-400">94% inside ideal 5.2 - 6.5 Hz</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-glass">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Stamina & Consistency
          </span>
          <div className="mt-1 text-2xl font-black text-amber-400 font-mono">12-Day Streak</div>
          <p className="mt-1 text-[11px] text-slate-400">495 total practice minutes</p>
        </div>
      </div>

      {/* 6-Axis Geometry & Pitch Trend Area Chart */}
      <VocalRadarOverview
        radarMetrics={analyticsData?.radarMetrics}
        progressTimeline={analyticsData?.progressTimeline}
      />

      {/* Weekly Practice Heatmap & Distribution */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Practice Load & Minutes Logged
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of practice volume across days of the week.
            </p>
          </div>
          <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-500/20">
            Total: 495 mins
          </span>
        </div>

        {/* Bar distribution */}
        <div className="grid grid-cols-7 gap-3 pt-4">
          {weeklyDistribution.map((item: any, idx: number) => {
            const heightPct = Math.max(12, Math.round((item.minutes / maxMinutes) * 100));
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative flex h-36 w-full items-end justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] p-1.5 overflow-hidden">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-brand-600 to-neon-cyan transition-all duration-700 shadow-glow"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="absolute top-2 font-mono text-[10px] text-slate-300 font-bold">
                    {item.minutes}m
                  </span>
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-400">{item.day}</span>
                <span className="text-[10px] text-slate-500">{item.sessions} takes</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocal Health & Intonation Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Zap className="h-5 w-5" />
            <h4 className="text-sm font-bold text-white">Pedagogical Intonation Milestones</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your cents deviation has dropped from an average of ±16.2 cents to ±9.4 cents. In human vocal pedagogy, maintaining deviations under 10 cents represents professional studio session intonation.
          </p>
          <div className="rounded-xl bg-black/30 p-3 border border-emerald-500/20 text-xs text-emerald-300">
            ✓ Sharp singing on upper fifths decreased from 24% to 8%.
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Music className="h-5 w-5" />
            <h4 className="text-sm font-bold text-white">Vocal Range & Tessitura Evolution</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your comfortable sustained vocal zone (tessitura) now sits smoothly between E3 and G4. The high note barrier at G#4 has been resolved with relaxed pharyngeal arching, reaching clean A4 notes.
          </p>
          <div className="rounded-xl bg-black/30 p-3 border border-cyan-500/20 text-xs text-cyan-300">
            ✓ Next target threshold: High B4 (MIDI 71) via mix voice blending.
          </div>
        </div>
      </div>
    </div>
  );
};
