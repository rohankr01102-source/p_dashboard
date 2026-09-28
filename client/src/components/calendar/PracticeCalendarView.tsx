"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  X,
  Play,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCalendar } from "@/lib/api";
import { ICalendarDay, ICalendarMonthResponse } from "@/types";

export const PracticeCalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<ICalendarDay | null>(null);

  const { data: calendarData, isLoading } = useQuery<ICalendarMonthResponse>({
    queryKey: ["calendar", currentYear, currentMonth],
    queryFn: () => fetchCalendar(currentYear, currentMonth),
    staleTime: 60 * 1000,
  });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const days = calendarData?.days || [];
  const activeDays = calendarData?.activeDaysCount || 0;
  const totalMins = calendarData?.totalPracticeMinutes || 0;
  const consistencyRate = calendarData?.consistencyRate || 0;
  const streak = calendarData?.currentStreak || 0;

  // First day offset for calendar alignment (0 = Sun)
  const firstDayOfWeek = days.length > 0 ? days[0].dayOfWeek : 0;
  const emptyPreSlots = Array.from({ length: firstDayOfWeek });

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 4:
        return "bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)]";
      case 3:
        return "bg-emerald-500/80 text-white border-emerald-500/60 font-semibold";
      case 2:
        return "bg-emerald-500/40 text-emerald-100 border-emerald-500/30";
      case 1:
        return "bg-emerald-500/20 text-emerald-200 border-emerald-500/20";
      default:
        return "bg-white/[0.02] text-slate-400 border-white/[0.05] hover:bg-white/[0.05]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-[#0c1220]/80 p-6 backdrop-blur-2xl shadow-glass">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Practice Calendar</h2>
              <p className="text-xs text-slate-400">
                Acoustic session tracking, daily consistency heatmap, and drill audit
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 backdrop-blur-md">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-28 text-center text-xs font-bold text-white font-mono">
              {calendarData?.monthName || "September"} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth() + 1);
            }}
            className="rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/20 transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Days</span>
            <CalendarIcon className="h-4 w-4 text-neon-cyan" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{activeDays} Days</div>
          <p className="mt-1 text-[11px] text-slate-500">Out of {calendarData?.daysInMonth || 30} days this month</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Practice</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {Math.round(totalMins / 60)}h {totalMins % 60}m
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Dedicated acoustic time</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Consistency Rate</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{consistencyRate}%</div>
          <p className="mt-1 text-[11px] text-slate-500">Practice adherence score</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Singing Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">{streak} Days</div>
          <p className="mt-1 text-[11px] text-slate-500">Active uninterrupted streak</p>
        </div>
      </div>

      {/* Main Calendar Heatmap Grid */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c1220]/80 p-6 backdrop-blur-2xl shadow-glass">
        {/* Heatmap Legend */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-b border-white/[0.06] pb-4">
          <div className="font-semibold text-slate-300">Heatmap Intensity:</div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500">0m</span>
            <span className="h-3 w-3 rounded-md bg-white/[0.04] border border-white/[0.08]" />
            <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
            <span className="h-3 w-3 rounded-md bg-emerald-500/40 border border-emerald-500/40" />
            <span className="h-3 w-3 rounded-md bg-emerald-500/80 border border-emerald-500/60" />
            <span className="h-3 w-3 rounded-md bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-[11px] text-slate-500">60m+</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyPreSlots.map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-transparent" />
          ))}

          {days.map((day) => {
            const hasSessions = day.sessionCount > 0;
            return (
              <motion.button
                key={day.date}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDay(day)}
                className={`relative flex h-24 flex-col justify-between rounded-2xl border p-2.5 text-left transition-all duration-200 ${getIntensityClass(
                  day.intensity
                )} ${day.isToday ? "ring-2 ring-neon-cyan ring-offset-2 ring-offset-[#090d16]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${day.intensity === 4 ? "text-slate-900" : "text-white"}`}>
                    {day.dayNumber}
                  </span>
                  {day.isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f5ff]" />
                  )}
                </div>

                <div>
                  {hasSessions ? (
                    <div>
                      <div className={`text-xs font-bold font-mono ${day.intensity === 4 ? "text-black" : "text-emerald-300"}`}>
                        {day.minutesPracticed}m
                      </div>
                      <div className={`text-[10px] truncate ${day.intensity === 4 ? "text-slate-800" : "text-slate-400"}`}>
                        {day.sessionCount} {day.sessionCount === 1 ? "take" : "takes"}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600">Rest</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drill & Session Log Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0c1427] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-neon-cyan" />
                    <span>Practice Log &bull; {selectedDay.date}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedDay.minutesPracticed} minutes logged across {selectedDay.sessionCount} takes
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedDay.sessions.length > 0 ? (
                  selectedDay.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2 hover:border-brand-500/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate max-w-xs">
                          {sess.title}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {sess.overallScore} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {sess.durationMinutes} mins
                        </span>
                        <span>Intonation: <strong className="text-white">{sess.pitchAccuracy}%</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sess.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] text-slate-300 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No vocal sessions recorded on this day.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="rounded-xl bg-white/[0.08] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.12] transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
