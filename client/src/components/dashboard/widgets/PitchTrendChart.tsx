"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Target, Zap, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { IMockPitchTrendPoint, mockPitchTrend } from "@/lib/mockData";

interface PitchTrendChartProps {
  data?: IMockPitchTrendPoint[];
}

export const PitchTrendChart: React.FC<PitchTrendChartProps> = ({
  data = mockPitchTrend,
}) => {
  const [timeRange, setTimeRange] = useState<"7D" | "14D" | "30D" | "ALL">("14D");

  const filteredData = React.useMemo(() => {
    if (timeRange === "7D") return data.slice(-5);
    if (timeRange === "14D") return data.slice(-7);
    return data;
  }, [data, timeRange]);

  const latestAccuracy = filteredData[filteredData.length - 1]?.accuracy ?? 96.4;
  const initialAccuracy = filteredData[0]?.accuracy ?? 87.2;
  const delta = (latestAccuracy - initialAccuracy).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-neon-cyan">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Pitch Trend & Intonation Centering
            </h3>
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              YIN Algorithmic DSP
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Microtonal pitch centering accuracy across consecutive vocal takes.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center space-x-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
          {(["7D", "14D", "30D", "ALL"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                timeRange === range
                  ? "bg-neon-cyan text-slate-950 font-bold shadow-glow-cyan"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Latest Pitch Accuracy
          </span>
          <div className="text-2xl font-black text-white font-mono flex items-baseline space-x-2">
            <span>{latestAccuracy}%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +{delta}%
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Average Cents Drift
          </span>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            ±5.4 cents
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Mastery Threshold
          </span>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            &ge; 90.0%
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pitchCyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
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
              domain={[80, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
            />

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as IMockPitchTrendPoint;
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
                          <span className="text-slate-400">Pitch Accuracy:</span>
                          <span className="font-mono font-bold text-neon-cyan">
                            {item.accuracy}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Cents Deviation:</span>
                          <span className="font-mono font-semibold text-emerald-400">
                            &plusmn;{item.centsError} cents
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-slate-400">Stability Rating:</span>
                          <span className="font-mono font-semibold text-indigo-300">
                            {item.stability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Reference Line for 90% Target */}
            <ReferenceLine
              y={90}
              stroke="#818cf8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Mastery (90%)",
                position: "insideTopRight",
                fill: "#818cf8",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#pitchCyanGradient)"
              activeDot={{
                r: 6,
                fill: "#090d16",
                stroke: "#06b6d4",
                strokeWidth: 3,
                className: "shadow-glow-cyan",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
