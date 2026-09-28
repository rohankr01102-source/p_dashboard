"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Gauge, Clock, ShieldCheck, Activity } from "lucide-react";
import { IMockTempoTrendPoint, mockTempoTrend } from "@/lib/mockData";

interface TempoTrendChartProps {
  data?: IMockTempoTrendPoint[];
}

export const TempoTrendChart: React.FC<TempoTrendChartProps> = ({
  data = mockTempoTrend,
}) => {
  const [metricView, setMetricView] = useState<"BPM" | "CONSISTENCY">("BPM");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-brand-300">
              <Gauge className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Tempo Trend & Metronome Alignment
            </h3>
            <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              Rhythmic Grid FFT
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Temporal stability, groove consistency, and BPM drift tracking across takes.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
          <button
            onClick={() => setMetricView("BPM")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metricView === "BPM"
                ? "bg-brand-600 text-white font-bold shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            BPM Tracking
          </button>
          <button
            onClick={() => setMetricView("CONSISTENCY")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metricView === "CONSISTENCY"
                ? "bg-brand-600 text-white font-bold shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Consistency %
          </button>
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Average Tempo Drift
          </span>
          <div className="text-2xl font-black text-white font-mono flex items-baseline space-x-2">
            <span>&plusmn;0.8 BPM</span>
            <span className="text-xs font-bold text-emerald-400">Stable</span>
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            On-Beat Grid Precision
          </span>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            96.2%
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Time Signature Reference
          </span>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            4/4 Swing & Straight
          </div>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempoBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />

            <YAxis
              domain={metricView === "BPM" ? [50, 140] : [80, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) =>
                metricView === "BPM" ? `${val}` : `${val}%`
              }
            />

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as IMockTempoTrendPoint;
                  return (
                    <div className="rounded-xl border border-white/[0.12] bg-[#090d16]/95 p-3 shadow-2xl backdrop-blur-2xl">
                      <div className="flex items-center justify-between space-x-4 border-b border-white/[0.08] pb-1.5 mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {item.sessionTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.date}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Measured Tempo:</span>
                          <span className="font-mono font-bold text-indigo-300">
                            {item.measuredBpm} BPM
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Target Tempo:</span>
                          <span className="font-mono font-semibold text-slate-300">
                            {item.targetBpm} BPM
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Drift Variance:</span>
                          <span className="font-mono font-semibold text-emerald-400">
                            &plusmn;{item.deviation} BPM
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Grid Consistency:</span>
                          <span className="font-mono font-semibold text-neon-cyan">
                            {item.consistency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {metricView === "BPM" ? (
              <>
                <Bar
                  dataKey="measuredBpm"
                  fill="url(#tempoBarGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Line
                  type="monotone"
                  dataKey="targetBpm"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="consistency"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#a855f7", stroke: "#090d16", strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
