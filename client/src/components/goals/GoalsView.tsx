"use client";

import React, { useState } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Flame,
  Award,
  Clock,
  Music,
  Crosshair,
  X,
} from "lucide-react";
import { IGoal } from "@/types";
import { createGoal, toggleGoal, deleteGoal } from "@/lib/api";
import { useVocalStore } from "@/store/useVocalStore";
import confetti from "canvas-confetti";

interface GoalsViewProps {
  goals: IGoal[];
  onRefresh?: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onRefresh }) => {
  const { showNotification } = useVocalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<any>("PITCH_ACCURACY");
  const [newTarget, setNewTarget] = useState(5);
  const [newUnit, setNewUnit] = useState("sessions");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const handleToggle = async (goal: IGoal) => {
    try {
      await toggleGoal(goal._id);
      if (!goal.isCompleted) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        showNotification(`Goal completed: "${goal.title}"! Keep up the momentum.`, "success");
      } else {
        showNotification("Goal reopened.", "info");
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showNotification("Could not update goal", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteGoal(id);
      showNotification("Goal deleted.", "info");
      if (onRefresh) onRefresh();
    } catch (err) {
      showNotification("Could not delete goal", "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotification("Please provide a goal title", "error");
      return;
    }

    if (newTarget <= 0) {
      showNotification("Target value must be greater than 0", "error");
      return;
    }

    try {
      await createGoal({
        title: newTitle,
        category: newCategory,
        targetValue: Math.max(1, Number(newTarget)),
        unit: newUnit,
        deadline: newDeadline ? new Date(newDeadline).toISOString() : undefined,
        description: newDescription,
      });

      setIsModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDeadline("");
      showNotification("New practice goal set!", "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showNotification("Failed to create goal", "error");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "PITCH_ACCURACY":
        return <Crosshair className="h-4 w-4 text-cyan-400" />;
      case "PRACTICE_TIME":
        return <Clock className="h-4 w-4 text-indigo-400" />;
      case "RANGE_EXPANSION":
        return <Music className="h-4 w-4 text-purple-400" />;
      case "DAILY_STREAK":
        return <Flame className="h-4 w-4 text-amber-400" />;
      default:
        return <Target className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
              <Target className="h-4 w-4 text-neon-cyan" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Vocal Goals & Practice Habit Tracker
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Set deliberate milestones for pitch precision, practice duration, high notes, and consistency streaks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Create new vocal goal"
          className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-4 py-2.5 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Vocal Goal</span>
        </button>
      </div>

      {/* Active Goals Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          In Progress ({activeGoals.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));
            return (
              <div
                key={goal._id}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl shadow-glass transition hover:border-brand-500/40 hover:bg-white/[0.04] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggle(goal)}
                      aria-label={`Mark goal '${goal.title}' as complete`}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                    >
                      <Circle className="h-5 w-5" />
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(goal.category)}
                        <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{goal.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(goal._id, e)}
                    aria-label={`Delete goal '${goal.title}'`}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 font-mono">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-mono text-neon-cyan font-bold">{pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-cyan transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Completed Milestones ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <div
                key={goal._id}
                className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-white line-through opacity-80">
                      {goal.title}
                    </h5>
                    <p className="text-[10px] text-emerald-300">
                      Completed 100% • {goal.targetValue} {goal.unit}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(goal)}
                  aria-label={`Reopen goal '${goal.title}'`}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Reopen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-goal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#090d16] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 id="create-goal-title" className="text-base font-bold text-white">Create New Vocal Goal</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label htmlFor="goal-title-input" className="text-[11px] font-semibold text-slate-400 block mb-1">
                Goal Title
              </label>
              <input
                id="goal-title-input"
                type="text"
                required
                placeholder="e.g. Hit 90%+ Pitch Accuracy in 5 Sessions"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-category-select" className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  id="goal-category-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1322] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                >
                  <option value="PITCH_ACCURACY">Pitch Accuracy</option>
                  <option value="PRACTICE_TIME">Practice Time</option>
                  <option value="RANGE_EXPANSION">Range Expansion</option>
                  <option value="VIBRATO_STABILITY">Vibrato Stability</option>
                  <option value="DAILY_STREAK">Daily Streak</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal-target-input" className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Target Value & Unit
                </label>
                <div className="flex gap-2">
                  <input
                    id="goal-target-input"
                    type="number"
                    min="1"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-20 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="goal-deadline-input" className="text-[11px] font-semibold text-slate-400 block mb-1">
                Target Deadline (Optional)
              </label>
              <input
                id="goal-deadline-input"
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1322] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="goal-desc-textarea" className="text-[11px] font-semibold text-slate-400 block mb-1">
                Description / Practice Focus
              </label>
              <textarea
                id="goal-desc-textarea"
                rows={2}
                placeholder="Why is this goal important? Focus on abdominal support..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neon-cyan px-5 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
