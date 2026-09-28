"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle, Flame, Sparkles, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import { useVocalStore } from "@/store/useVocalStore";

interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  isCompleted: boolean;
}

const initialGoals: GoalItem[] = [
  {
    id: "g1",
    title: "Pitch Intonation & Micro-Tuning Drills",
    current: 5,
    target: 5,
    unit: "sessions",
    isCompleted: true,
  },
  {
    id: "g2",
    title: "High Register Agility (A4 to F5)",
    current: 3,
    target: 4,
    unit: "sessions",
    isCompleted: false,
  },
  {
    id: "g3",
    title: "Full Repertoire Run-throughs",
    current: 2,
    target: 2,
    unit: "takes",
    isCompleted: true,
  },
  {
    id: "g4",
    title: "Diaphragmatic Breath Stamina Exercise",
    current: 4,
    target: 5,
    unit: "sessions",
    isCompleted: false,
  },
];

export const WeeklyGoalProgress: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);
  const { showNotification } = useVocalStore();

  const completedCount = goals.filter((g) => g.isCompleted).length;
  const overallPercentage = Math.round((completedCount / goals.length) * 100);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextState = !g.isCompleted;
          if (nextState) {
            // Trigger confetti
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#06b6d4", "#6366f1", "#10b981", "#a855f7"],
            });
            showNotification(`Completed: "${g.title}"! 🎉`, "success");
            return { ...g, isCompleted: true, current: g.target };
          }
          return { ...g, isCompleted: false, current: Math.max(0, g.target - 1) };
        }
        return g;
      })
    );
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#06b6d4", "#6366f1", "#f59e0b", "#10b981", "#ec4899"],
    });
    showNotification("Weekly practice milestones unlocked! 🚀", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-brand-300">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Weekly Goal Progress & Habits
            </h3>
            <p className="text-xs text-slate-400">
              Active vocal conditioning targets for this 7-day cycle.
            </p>
          </div>
        </div>

        <button
          onClick={handleCelebrate}
          className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-brand-300 hover:bg-indigo-500/20 transition-all hover:scale-105"
        >
          <PartyPopper className="h-3.5 w-3.5 text-neon-cyan" />
          <span>Celebrate</span>
        </button>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">
            Total Cycle Completion ({completedCount} of {goals.length} Habits)
          </span>
          <span className="font-mono font-bold text-neon-cyan">{overallPercentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-400 to-neon-cyan shadow-[0_0_12px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>

      {/* Interactive Habit List */}
      <div className="mt-4 space-y-2.5">
        {goals.map((goal) => {
          const itemPct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 transition-all duration-200 hover:border-brand-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  aria-label={goal.isCompleted ? `Mark ${goal.title} incomplete` : `Mark ${goal.title} complete`}
                  className="text-slate-500 group-hover:text-neon-cyan transition-colors"
                >
                  {goal.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <h4
                    className={`text-xs font-semibold transition-colors ${
                      goal.isCompleted
                        ? "text-slate-400 line-through"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {goal.title}
                  </h4>
                  <div className="mt-0.5 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span>&bull;</span>
                    <span className={goal.isCompleted ? "text-emerald-400 font-semibold" : "text-indigo-300"}>
                      {itemPct}% completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Item Progress Pill */}
              <div className="w-20 hidden sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.isCompleted
                        ? "bg-emerald-400"
                        : "bg-gradient-to-r from-brand-500 to-indigo-400"
                    }`}
                    style={{ width: `${itemPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
