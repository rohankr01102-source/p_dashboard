"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Sparkles,
  Info,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSmartRecommendations } from "@/lib/api";
import { ISmartRecommendationsResponse, ISuggestedWarmup, IWeakArea } from "@/types";
import { useVocalStore } from "@/store/useVocalStore";

export const SmartRecommendationsPanel: React.FC = () => {
  const { showNotification, setActiveTab } = useVocalStore();
  const [activeDrillTimer, setActiveDrillTimer] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const { data: recData, isLoading } = useQuery<ISmartRecommendationsResponse>({
    queryKey: ["smartRecommendations"],
    queryFn: fetchSmartRecommendations,
    staleTime: 60 * 1000,
  });

  const duration = recData?.suggestedDuration || {
    recommendedMinutes: 30,
    intensity: "Balanced Workout",
    rationale: "Optimal vocal stamina detected. A 30-minute workout will yield peak intonation progress.",
    fatigueRiskLevel: "Low",
  };

  const warmups = recData?.suggestedWarmups || [];
  const weakAreas = recData?.weakAreas || [];

  const handleStartWarmup = (warmup: ISuggestedWarmup) => {
    if (activeDrillTimer === warmup.id) {
      setActiveDrillTimer(null);
      setSecondsRemaining(0);
      showNotification(`Paused warmup drill: ${warmup.title}`, "info");
    } else {
      setActiveDrillTimer(warmup.id);
      setSecondsRemaining(warmup.durationMinutes * 60);
      showNotification(`Started warmup drill: ${warmup.title} (${warmup.durationMinutes}m)`, "success");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "MODERATE":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c1220]/80 p-6 backdrop-blur-2xl shadow-glass space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600/30 to-neon-cyan/20 border border-brand-500/30 text-neon-cyan shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>AI Smart Recommendations</span>
              <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
            </h3>
            <p className="text-xs text-slate-400">
              Personalized practice duration, prescribed acoustic drills, and weak area analysis
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center space-x-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 hover:bg-neon-cyan/20 px-3 py-1.5 text-xs font-bold text-neon-cyan transition shadow-[0_0_10px_rgba(0,245,255,0.15)]"
        >
          <span>Open Live Studio</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Recommended Practice Duration Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-brand-950/40 via-[#0c1427] to-cyan-950/30 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Clock className="h-4 w-4 text-neon-cyan" />
            <span>Optimal Practice Duration Today</span>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              duration.fatigueRiskLevel === "Elevated"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                : duration.fatigueRiskLevel === "Moderate"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            Fatigue Risk: {duration.fatigueRiskLevel}
          </span>
        </div>

        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-black text-white font-mono tracking-tight">
            {duration.recommendedMinutes} Minutes
          </span>
          <span className="rounded-lg bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-xs font-semibold text-slate-300">
            {duration.intensity}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">{duration.rationale}</p>
      </div>

      {/* Suggested Warmups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Targeted Warmup Drills
          </span>
          <span className="text-[11px] text-slate-500">Curated for your vocal type</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {warmups.map((w) => {
            const isPlaying = activeDrillTimer === w.id;
            return (
              <div
                key={w.id}
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3 hover:border-brand-500/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="rounded-md bg-brand-500/20 border border-brand-500/30 px-2 py-0.5 text-[9px] font-bold text-brand-300">
                      {w.durationMinutes} Mins &bull; {w.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[120px]">
                      {w.focus}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{w.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {w.instructions}
                  </p>
                </div>

                <button
                  onClick={() => handleStartWarmup(w)}
                  className={`flex items-center justify-center space-x-1.5 w-full rounded-xl py-2 text-xs font-bold transition ${
                    isPlaying
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                      : "bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white"
                  }`}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? "Pause Drill Timer" : "Start Warmup"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Area Identification Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Weak Area Diagnostics & Remedies
          </span>
          <span className="text-[11px] text-slate-500">Based on recent intonation curves</span>
        </div>

        <div className="space-y-2.5">
          {weakAreas.map((area) => (
            <div
              key={area.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2 hover:border-amber-500/30 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white">{area.areaTitle}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${getSeverityBadge(area.severity)}`}>
                  {area.severity} Impact
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Observation:</strong> {area.diagnosticObservation}
              </p>

              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-[11px] text-emerald-300 flex items-start space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Prescribed Remedy:</strong> {area.prescribedRemedy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocal Health Tip Banner */}
      {recData?.vocalHealthTip && (
        <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3.5 flex items-center space-x-3 text-xs text-brand-200">
          <Info className="h-4 w-4 text-neon-cyan flex-shrink-0" />
          <span>{recData.vocalHealthTip}</span>
        </div>
      )}
    </div>
  );
};
