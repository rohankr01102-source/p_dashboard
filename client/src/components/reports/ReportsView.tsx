"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  Clock,
  Music,
} from "lucide-react";
import { IReport } from "@/types";
import { generateReport } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";

interface ReportsViewProps {
  reports: IReport[];
  onRefresh?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reports, onRefresh }) => {
  const { showNotification } = useVocalStore();
  const safeReports = Array.isArray(reports) ? reports : [];
  const [selectedReport, setSelectedReport] = useState<IReport | null>(
    safeReports.length > 0 ? safeReports[0] : null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (period: "WEEKLY" | "MONTHLY" | "COMPREHENSIVE") => {
    try {
      setIsGenerating(true);
      const rep = await generateReport(period);
      showNotification(`Generated new ${period.toLowerCase()} vocal report!`, "success");
      setSelectedReport(rep);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showNotification("Could not generate report", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentReport = selectedReport || safeReports[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
              <FileText className="h-4 w-4 text-neon-cyan" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Vocal Health & Progress Reports
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Exportable evaluations for vocal coaches, speech pathologists, and singers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleGenerate("WEEKLY")}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-neon-cyan px-4 py-2.5 text-xs font-bold text-white shadow-glow transition hover:opacity-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isGenerating ? "Synthesizing..." : "Generate New Report"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Selection Tabs */}
      {safeReports.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {safeReports.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedReport(r)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                currentReport?._id === r._id
                  ? "bg-neon-cyan text-slate-950 font-bold shadow-glow-cyan"
                  : "border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-white"
              }`}
            >
              {r.title} ({formatDate(r.createdAt)})
            </button>
          ))}
        </div>
      )}

      {/* Report Document View */}
      {currentReport && (
        <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] p-6 sm:p-8 backdrop-blur-2xl shadow-glass space-y-6">
          {/* Report Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                {currentReport.reportPeriod} VOCAL EVALUATION
              </span>
              <h3 className="mt-2 text-2xl font-black text-white">{currentReport.title}</h3>
              <p className="mt-1 text-xs text-slate-400">
                Period: {formatDate(currentReport.startDate)} – {formatDate(currentReport.endDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Intonation Score
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {currentReport.summary.pitchAccuracyAvg}%
              </div>
              <span className="text-[11px] text-emerald-300">
                Grade: A (Optimal Centering)
              </span>
            </div>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-3.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Takes</span>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {currentReport.summary.totalSessions} Sessions
              </div>
              <span className="text-[10px] text-slate-400">
                {currentReport.summary.totalMinutesPracticed} practice mins
              </span>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-3.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Range Covered</span>
              <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                {currentReport.summary.rangeCovered}
              </div>
              <span className="text-[10px] text-slate-400">21 Semitones active</span>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-3.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Pitch Stability</span>
              <div className="text-xl font-black text-brand-400 font-mono mt-0.5">
                {currentReport.summary.stabilityAvg}%
              </div>
              <span className="text-[10px] text-slate-400">Micro-jitter controlled</span>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-3.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Vibrato Quality</span>
              <div className="text-xl font-black text-purple-400 font-mono mt-0.5">
                {currentReport.summary.vibratoConsistencyAvg}%
              </div>
              <span className="text-[10px] text-slate-400">5.6 – 5.9 Hz oscillation</span>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Validated Vocal Strengths</span>
              </h4>
              <ul className="space-y-2">
                {currentReport.keyStrengths?.map((str, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-slate-300"
                  >
                    • {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>Targeted Growth Opportunities</span>
              </h4>
              <ul className="space-y-2">
                {currentReport.growthAreas?.map((area, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-slate-300"
                  >
                    • {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prescribed Warmups */}
          {currentReport.prescribedWarmups?.length > 0 && (
            <div className="border-t border-white/[0.08] pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center space-x-1.5 mb-3">
                <Dumbbell className="h-4 w-4" />
                <span>Prescribed Clinical & Pedagogical Warmup Routine</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReport.prescribedWarmups.map((w, i) => (
                  <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{w.title}</h5>
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                        {w.focus}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                      {w.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
