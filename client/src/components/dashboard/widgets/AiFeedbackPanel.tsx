"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  Zap,
} from "lucide-react";
import { mockAiFeedback, IMockAiFeedback } from "@/lib/mockData";
import { useVocalStore } from "@/store/useVocalStore";

interface AiFeedbackPanelProps {
  feedback?: IMockAiFeedback;
}

export const AiFeedbackPanel: React.FC<AiFeedbackPanelProps> = ({
  feedback = mockAiFeedback,
}) => {
  const { showNotification, setActiveTab } = useVocalStore();
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);

  const handleStartDrill = (drillTitle: string) => {
    setActiveDrillId(drillTitle);
    showNotification(`Loaded drill: "${drillTitle}". Launching studio...`, "info");
    setTimeout(() => {
      setActiveTab("studio");
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-neon-cyan p-0.5 shadow-glow">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Vocal Coach & Diagnostic Intelligence
              </h3>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 animate-pulse">
                DSP Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Formant analysis, intonation correction, and prescriptive pedagogical drills.
            </p>
          </div>
        </div>

        {/* Vocal Health Gauge */}
        <div className="flex items-center space-x-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Vocal Health</span>
            <div className="font-mono font-bold text-emerald-400 flex items-center justify-end">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {feedback.healthScore}% Optimal
            </div>
          </div>
          <div className="h-7 w-px bg-white/[0.08]" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Fatigue Risk</span>
            <p className="font-mono font-semibold text-cyan-300">{feedback.fatigueRisk}</p>
          </div>
        </div>
      </div>

      {/* Real-Time Acoustic Summary Card */}
      <div className="mt-4 rounded-xl border border-white/[0.08] bg-gradient-to-r from-brand-950/40 via-cyan-950/20 to-transparent p-4 text-xs leading-relaxed text-slate-300">
        <p className="font-medium text-slate-200">
          <strong className="text-neon-cyan font-semibold">Acoustic Assessment: </strong>
          {feedback.summary}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-2.5 text-[11px] text-slate-400">
          <span className="flex items-center font-mono">
            <Zap className="mr-1 h-3 w-3 text-neon-cyan" />
            Singer&apos;s Formant: <strong className="text-white ml-1">{feedback.acousticProfile.singersFormantHz} Hz</strong>
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="font-mono">
            Vibrato: <strong className="text-brand-300 ml-1">{feedback.acousticProfile.vibratoRateHz} Hz</strong> (&plusmn;{feedback.acousticProfile.vibratoDepthCents}c)
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="font-mono text-emerald-400">
            Strain Risk: {feedback.vocalStrainStatus}
          </span>
        </div>
      </div>

      {/* Prescribed Coaching Drills */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3">
          <span>Actionable Recommended Drills</span>
          <span className="text-[11px] text-slate-500 font-mono">Adaptive AI Plan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {feedback.recommendedDrills.map((drill) => (
            <div
              key={drill.id}
              className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 transition-all duration-200 hover:border-brand-500/30 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-bold text-slate-300 font-mono">
                    {drill.duration}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-bold text-[9px] ${
                      drill.difficulty === "Beginner"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : drill.difficulty === "Intermediate"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : drill.difficulty === "Advanced"
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {drill.difficulty}
                  </span>
                </div>

                <h4 className="mt-2 text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">
                  {drill.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {drill.instructions}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] text-brand-300 font-medium">
                  {drill.targetArea}
                </span>
                <button
                  onClick={() => handleStartDrill(drill.title)}
                  className="flex items-center space-x-1 rounded-lg bg-neon-cyan/15 hover:bg-neon-cyan text-neon-cyan hover:text-slate-950 px-2 py-1 text-[11px] font-bold transition-all"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>Practice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
