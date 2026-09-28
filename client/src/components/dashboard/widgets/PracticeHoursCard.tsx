"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Sparkles, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PracticeHoursCardProps {
  totalHours?: number;
  totalMinutes?: number;
  monthlyTargetHours?: number;
  weeklyDeltaPct?: number;
}

const sparklineData = [
  { day: "Mon", hours: 2.1 },
  { day: "Tue", hours: 2.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 3.9 },
  { day: "Fri", hours: 3.4 },
  { day: "Sat", hours: 4.8 },
  { day: "Sun", hours: 4.3 },
];

export const PracticeHoursCard: React.FC<PracticeHoursCardProps> = ({
  totalHours = 24.5,
  totalMinutes = 1470,
  monthlyTargetHours = 30,
  weeklyDeltaPct = 18.4,
}) => {
  const targetPct = Math.min(100, Math.round((totalHours / monthlyTargetHours) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-brand-500/40 hover:bg-[#0f172a]/80"
    >
      {/* Top subtle radial glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
            <Clock className="h-4 w-4 text-brand-300" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Practice Hours
            </span>
            <p className="text-[10px] text-slate-500">Deliberate vocal training</p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          +{weeklyDeltaPct}%
        </span>
      </div>

      {/* Main KPI display & Mini Sparkline */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {totalHours.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">hrs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            <strong className="text-slate-200 font-mono">{totalMinutes.toLocaleString()}</strong> mins logged across sessions
          </p>
        </div>

        {/* Micro Sparkline Chart */}
        <div className="h-12 w-28 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="practiceHoursGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-white/[0.1] bg-[#090d16]/90 px-2 py-1 text-[10px] text-white shadow-xl backdrop-blur-md">
                        <span className="font-mono font-bold text-indigo-300">
                          {payload[0].value} hrs
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#818cf8"
                strokeWidth={2}
                fill="url(#practiceHoursGlow)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress towards Monthly Goal */}
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center">
            <Target className="mr-1 h-3 w-3 text-slate-500" />
            Monthly Target ({monthlyTargetHours}h)
          </span>
          <span className="font-mono font-bold text-indigo-300">{targetPct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${targetPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>
    </motion.div>
  );
};
