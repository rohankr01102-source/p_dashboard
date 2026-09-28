"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, Sparkles, Activity } from "lucide-react";

interface PerformanceScoreCardProps {
  score?: number;
  grade?: string;
  weeklyDelta?: number;
  intonationAccuracy?: number;
  tempoConsistency?: number;
  timbreClarity?: number;
}

export const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({
  score = 92.4,
  grade = "A+",
  weeklyDelta = 4.6,
  intonationAccuracy = 94.2,
  tempoConsistency = 89.8,
  timbreClarity = 93.1,
}) => {
  // SVG circular gauge properties
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-violet-500/40 hover:bg-[#0f172a]/80"
    >
      {/* Top violet glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4 text-violet-300" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Performance Score
            </span>
            <p className="text-[10px] text-slate-500">Multimodal composite DSP index</p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
          <Award className="h-3 w-3 mr-0.5 text-violet-400" />
          {grade} Elite
        </span>
      </div>

      {/* Main KPI display & Circular Progress Ring */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {score.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 flex items-center text-[11px] font-medium text-emerald-400">
            <TrendingUp className="mr-1 h-3 w-3" />
            +{weeklyDelta}% vs 30-day baseline
          </p>
        </div>

        {/* Circular SVG Score Ring */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg className="h-14 w-14 -rotate-90 transform overflow-visible">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
              fill="transparent"
            />
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              stroke="url(#scoreVioletGrad)"
              strokeWidth="4"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="scoreVioletGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-[11px] font-black text-white font-mono">
            {grade}
          </span>
        </div>
      </div>

      {/* Sub-Metric Bars Breakdown */}
      <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3 text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Intonation</span>
          <span className="font-mono text-cyan-300 font-semibold">{intonationAccuracy}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Rhythm & Tempo</span>
          <span className="font-mono text-indigo-300 font-semibold">{tempoConsistency}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Timbre Clarity</span>
          <span className="font-mono text-violet-300 font-semibold">{timbreClarity}%</span>
        </div>
      </div>
    </motion.div>
  );
};
