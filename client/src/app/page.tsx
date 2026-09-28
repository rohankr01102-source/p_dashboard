"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { AudioStudio } from "@/components/studio/AudioStudio";
import { SessionsListView } from "@/components/sessions/SessionsListView";
import { RecordingsView } from "@/components/recordings/RecordingsView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { GoalsView } from "@/components/goals/GoalsView";
import { AchievementsView } from "@/components/achievements/AchievementsView";
import { ReportsView } from "@/components/reports/ReportsView";
import { ProfileView } from "@/components/profile/ProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { SessionDetailModal } from "@/components/sessions/SessionDetailModal";
import { PracticeCalendarView } from "@/components/calendar/PracticeCalendarView";

import { useVocalStore } from "@/store/useVocalStore";
import {
  fetchProfile,
  fetchSessions,
  fetchAnalytics,
  fetchGoals,
  fetchAchievements,
  fetchReports,
} from "@/lib/api";
import { CheckCircle2, AlertCircle, Info, Sparkles, RefreshCw, Cpu } from "lucide-react";

export default function VocalyticsHome() {
  const {
    activeTab,
    setUser,
    user,
    selectedSession,
    setSelectedSession,
    notification,
    clearNotification,
  } = useVocalStore();

  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // React Queries with retry limits and 60-second staleTime cache
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: sessionsData = [],
    isLoading: isSessionsLoading,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: goalsData = [],
    isLoading: isGoalsLoading,
    refetch: refetchGoals,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: achievementsData,
    isLoading: isAchievementsLoading,
    refetch: refetchAchievements,
  } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: reportsData = [],
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    retry: 2,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    }
  }, [profileData, setUser]);

  const refreshAll = () => {
    refetchProfile();
    refetchSessions();
    refetchAnalytics();
    refetchGoals();
    refetchAchievements();
    refetchReports();
  };

  const isInitialLoading = isProfileLoading && !profileData;
  const hasError = isProfileError && isSessionsError && !profileData;

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">Loading Vocalytics AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex items-center space-x-2 rounded-2xl border border-white/[0.12] bg-[#0c1427]/90 px-4 py-3 text-xs font-semibold backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4"
        >
          {notification.type === "success" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          {notification.type === "info" && (
            <Info className="h-4 w-4 text-neon-cyan" />
          )}
          <span className="text-white">{notification.message}</span>
          <button
            onClick={clearNotification}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </aside>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {/* Global Error Banner */}
            {hasError && (
              <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>Unable to synchronize with backend services. Operating in offline resilient mode.</span>
                </div>
                <button
                  onClick={refreshAll}
                  className="flex items-center space-x-1 rounded-xl bg-rose-500/20 px-3 py-1 font-bold text-white hover:bg-rose-500/30 transition"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Skeleton Loading State */}
            {isInitialLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-44 rounded-3xl bg-white/[0.03] border border-white/[0.05]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
                  ))}
                </div>
                <div className="h-72 rounded-3xl bg-white/[0.03] border border-white/[0.05]" />
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && (
                  <DashboardOverview
                    user={user}
                    sessions={sessionsData}
                    goals={goalsData}
                    achievements={achievementsData?.achievements || []}
                    analyticsData={analyticsData}
                  />
                )}

                {activeTab === "analytics" && (
                  <AnalyticsView analyticsData={analyticsData} />
                )}

                {(activeTab === "recordings" || activeTab === "sessions") && (
                  <RecordingsView
                    sessions={sessionsData}
                    onRefresh={refreshAll}
                  />
                )}

                {activeTab === "goals" && (
                  <GoalsView goals={goalsData} onRefresh={refetchGoals} />
                )}

                {activeTab === "achievements" && (
                  <AchievementsView achievementsData={achievementsData} />
                )}

                {activeTab === "profile" && (
                  <ProfileView user={user} onRefresh={refetchProfile} />
                )}

                {activeTab === "settings" && <SettingsView />}

                {activeTab === "studio" && <AudioStudio />}

                {activeTab === "calendar" && <PracticeCalendarView />}

                {activeTab === "reports" && (
                  <ReportsView reports={reportsData} onRefresh={refetchReports} />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Deep-Dive Session AI Analysis Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
