"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Upload,
  Sparkles,
  Zap,
  TrendingUp,
  Layers,
  Calendar,
  Share2,
  Download,
} from "lucide-react";
import { IUser, ISession, IGoal, IAchievement } from "@/types";
import { useVocalStore } from "@/store/useVocalStore";
import { mockAnalyticsData, mockSessions } from "@/lib/mockData";

// The 10 Requested Dashboard Widgets
import { PracticeHoursCard } from "./widgets/PracticeHoursCard";
import { SingingStreakCard } from "./widgets/SingingStreakCard";
import { UploadCountCard } from "./widgets/UploadCountCard";
import { PerformanceScoreCard } from "./widgets/PerformanceScoreCard";
import { PitchTrendChart } from "./widgets/PitchTrendChart";
import { TempoTrendChart } from "./widgets/TempoTrendChart";
import { VocalRangeVisualization } from "./widgets/VocalRangeVisualization";
import { WeeklyGoalProgress } from "./widgets/WeeklyGoalProgress";
import { AiFeedbackPanel } from "./widgets/AiFeedbackPanel";
import { RecentRecordingsTable } from "./widgets/RecentRecordingsTable";
import { SmartRecommendationsPanel } from "./widgets/SmartRecommendationsPanel";
import { PersonalBestWidget } from "../analytics/PersonalBestWidget";

interface DashboardOverviewProps {
  user: IUser | null;
  sessions: ISession[];
  goals: IGoal[];
  achievements: IAchievement[];
  analyticsData?: any;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  sessions,
  goals,
  achievements,
  analyticsData,
}) => {
  const { setActiveTab, showNotification } = useVocalStore();
  const [dashboardTimeFilter, setDashboardTimeFilter] = useState<"This Week" | "This Month" | "All-Time">("This Week");

  const effectiveSessions = sessions && sessions.length > 0 ? sessions : mockSessions;
  const kpis = analyticsData?.kpis || mockAnalyticsData.kpis;

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, sessions: effectiveSessions, kpis }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vocalytics_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Exported vocal telemetry dataset (JSON)", "success");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Linear / Stripe Caliber Hero Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-brand-950/60 via-[#0c1427]/90 to-brand-950/40 p-6 md:p-8 backdrop-blur-2xl shadow-glass"
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-cyan/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-xs font-semibold text-neon-cyan mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Vocal Coach AI 4.0 DSP Engine Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-neon-cyan via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user?.name || "Elena Vance"}
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your intonation accuracy has improved by <strong className="text-neon-cyan font-bold">+4.6%</strong> this week.
              Acoustic tessitura shows rock-solid stability across your <strong className="text-white font-mono">C3 &ndash; A5</strong> vocal range.
            </p>
          </div>

          {/* Quick Action CTA Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-neon-cyan via-cyan-500 to-brand-500 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-glow-cyan transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="h-4 w-4" />
              <span>Start Vocal Practice</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center space-x-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Upload className="h-4 w-4 text-slate-400" />
              <span>Upload Take</span>
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-3 text-xs font-semibold text-slate-400 hover:text-white transition hover:bg-white/[0.08]"
              title="Export telemetry"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          WIDGETS 1 - 4: Top Primary KPI Cards Grid
          1. Practice Hours Card
          2. Singing Streak Card
          3. Upload Count Card
          4. Performance Score Card
         ======================================================== */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Widget 1: Practice Hours Card */}
          <PracticeHoursCard
            totalHours={kpis.totalPracticeHours ?? 24.5}
            totalMinutes={kpis.totalMinutes ?? 1470}
            monthlyTargetHours={30}
            weeklyDeltaPct={18.4}
          />

          {/* Widget 2: Singing Streak Card */}
          <SingingStreakCard
            currentStreak={user?.streakDays ?? user?.currentStreak ?? kpis.streakDays ?? 14}
            longestStreak={user?.longestStreak ?? 28}
          />

          {/* Widget 3: Upload Count Card */}
          <UploadCountCard
            totalUploads={effectiveSessions.length || kpis.totalSessions || 84}
            weeklyUploads={kpis.weeklyUploadCount ?? 8}
            storageUsedBytes={kpis.storageUsedBytes ?? 1488977920}
            storageMaxBytes={kpis.storageMaxBytes ?? 5368709120}
          />

          {/* Widget 4: Performance Score Card */}
          <PerformanceScoreCard
            score={kpis.overallScore ?? 92.4}
            grade="A+"
            weeklyDelta={kpis.weeklyGrowthPct ?? 4.6}
            intonationAccuracy={Math.round(kpis.avgPitchAccuracy ?? 94.2)}
            tempoConsistency={Math.round(kpis.avgTempoStability ?? 89.8)}
            timbreClarity={93.1}
          />
        </div>
      </section>

      {/* ========================================================
          WIDGETS 5 & 6: Longitudinal Trend Charts Grid (Recharts)
          5. Pitch Trend Chart
          6. Tempo Trend Chart
         ======================================================== */}
      <section aria-label="Pitch and Tempo Analytics">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Widget 5: Pitch Trend Chart */}
          <PitchTrendChart data={analyticsData?.pitchTrend} />

          {/* Widget 6: Tempo Trend Chart */}
          <TempoTrendChart data={analyticsData?.tempoTrend} />
        </div>
      </section>

      {/* ========================================================
          WIDGETS 7 & 8: Range Visualizer & Weekly Goal Progress
          7. Vocal Range Visualization
          8. Weekly Goal Progress
         ======================================================== */}
      <section aria-label="Vocal Range and Goals">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Widget 7: Vocal Range Visualization (7 Cols) */}
          <div className="lg:col-span-7">
            <VocalRangeVisualization rangeData={analyticsData?.vocalRange} />
          </div>

          {/* Widget 8: Weekly Goal Progress (5 Cols) */}
          <div className="lg:col-span-5">
            <WeeklyGoalProgress />
          </div>
        </div>
      </section>

      {/* ========================================================
          SMART RECOMMENDATIONS: Suggested Duration, Warmups, Weak Areas
         ======================================================== */}
      <section aria-label="Smart Recommendations">
        <SmartRecommendationsPanel />
      </section>

      {/* ========================================================
          PERSONAL BEST TRACKING: All-Time Vocal Records
         ======================================================== */}
      <section aria-label="Personal Best Records">
        <PersonalBestWidget />
      </section>

      {/* ========================================================
          WIDGET 9: AI Feedback Panel
         ======================================================== */}
      <section aria-label="AI Feedback and Diagnostics">
        <AiFeedbackPanel feedback={analyticsData?.aiFeedback} />
      </section>

      {/* ========================================================
          WIDGET 10: Recent Recordings Table
         ======================================================== */}
      <section aria-label="Recent Vocal Recordings">
        <RecentRecordingsTable sessions={effectiveSessions} />
      </section>
    </div>
  );
};
