"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, ShieldCheck, Calendar, Sparkles } from "lucide-react";

interface SingingStreakCardProps {
  currentStreak?: number;
  longestStreak?: number;
}

interface DayState {
  day: string;
  dateStr: string;
  isCompleted: boolean;
  minutes: number;
}

const defaultWeekDays: DayState[] = [
  { day: "M", dateStr: "Sep 22", isCompleted: true, minutes: 45 },
  { day: "T", dateStr: "Sep 23", isCompleted: true, minutes: 35 },
  { day: "W", dateStr: "Sep 24", isCompleted: true, minutes: 50 },
  { day: "T", dateStr: "Sep 25", isCompleted: true, minutes: 60 },
  { day: "F", dateStr: "Sep 26", isCompleted: true, minutes: 40 },
  { day: "S", dateStr: "Sep 27", isCompleted: true, minutes: 80 },
  { day: "S", dateStr: "Sep 28", isCompleted: true, minutes: 70 },
];

export const SingingStreakCard: React.FC<SingingStreakCardProps> = ({
  currentStreak = 14,
  longestStreak = 28,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayState | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-amber-500/40 hover:bg-[#0f172a]/80"
    >
      {/* Top amber glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <Flame className="h-4 w-4 text-amber-400" />
          </motion.div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Singing Streak
            </span>
            <p className="text-[10px] text-slate-500">Consecutive practice days</p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <Sparkles className="h-3 w-3 mr-0.5" />
          On Fire
        </span>
      </div>

      {/* KPI Display */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {currentStreak}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Personal Record: <strong className="text-amber-300 font-mono">{longestStreak} Days</strong>
          </p>
        </div>

        {/* Streak Shield */}
        <div className="flex items-center space-x-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-[10px] text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Freeze Active</span>
        </div>
      </div>

      {/* Interactive 7-Day Mini Calendar Tracker */}
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>This Week&apos;s Rhythm</span>
          <span className="text-amber-400 font-mono font-semibold">
            {hoveredDay ? `${hoveredDay.dateStr}: ${hoveredDay.minutes}m` : "7 / 7 Completed"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {defaultWeekDays.map((item, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              className="group/day relative flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 py-1.5 transition-all hover:scale-105 hover:bg-amber-500/20 hover:border-amber-400"
            >
              <span className="text-[10px] font-bold text-amber-200">{item.day}</span>
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
