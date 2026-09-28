"use client";

import React, { useState } from "react";
import {
  Mic,
  Flame,
  Clock,
  Sparkles,
  Activity,
  Music,
  User,
  Bell,
  Check,
  CheckCircle2,
  Trophy,
  Target,
  AlertCircle,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVocalStore } from "@/store/useVocalStore";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import { INotification } from "@/types";

export const Navbar: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab, user, showNotification } = useVocalStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "BADGES" | "STREAKS">("ALL");

  const { data: notifications = [] } = useQuery<INotification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: fetchUnreadNotificationCount,
    staleTime: 30 * 1000,
  });

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
    queryClient.setQueryData<INotification[]>(["notifications"], (old = []) =>
      old.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    queryClient.setQueryData<number>(["unreadCount"], (c = 0) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    queryClient.setQueryData<INotification[]>(["notifications"], (old = []) =>
      old.map((n) => ({ ...n, isRead: true }))
    );
    queryClient.setQueryData<number>(["unreadCount"], 0);
    showNotification("All notifications marked as read.", "success");
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === "UNREAD") return !n.isRead;
    if (filterType === "BADGES") return n.type === "BADGE_UNLOCKED";
    if (filterType === "STREAKS") return n.type === "STREAK_WARNING";
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "BADGE_UNLOCKED":
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case "STREAK_WARNING":
        return <Flame className="h-4 w-4 text-amber-500" />;
      case "GOAL_ACHIEVED":
        return <Target className="h-4 w-4 text-emerald-400" />;
      case "ANALYSIS_READY":
        return <Sparkles className="h-4 w-4 text-neon-cyan" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex cursor-pointer items-center space-x-3 transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-neon-cyan p-0.5 shadow-glow">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
              <Activity className="h-5 w-5 text-neon-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">
                Vocalytics<span className="text-neon-cyan">.AI</span>
              </span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              AI Vocal Analysis & Pedagogical Coaching
            </p>
          </div>
        </div>

        {/* Top KPI Badges */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Streak Badge */}
          <div
            onClick={() => setActiveTab("analytics")}
            className="cursor-pointer flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:bg-amber-500/20 transition"
          >
            <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
            <span>{user?.streakDays ?? user?.currentStreak ?? 14} Day Streak</span>
          </div>

          {/* Practice Time */}
          <div className="flex items-center space-x-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            <span>
              {user?.totalPracticeMinutes ?? Math.round((user?.totalPracticeHours || 0) * 60)} min practiced
            </span>
          </div>

          {/* Voice Type */}
          <div className="flex items-center space-x-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Music className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              {user?.voiceType || user?.vocalType || "Tenor"} ({user?.vocalRangeLowest || "C3"} -{" "}
              {user?.vocalRangeHighest || "A4"})
            </span>
          </div>
        </div>

        {/* Action Button & User Avatar */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="View notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_#f43f5e]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-white/[0.12] bg-[#0c1427]/95 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-neon-cyan/20 border border-neon-cyan/30 px-2 py-0.5 text-[10px] font-bold text-neon-cyan">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-neon-cyan hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="ml-2 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 py-2.5 border-b border-white/[0.06] text-[10px]">
                  {(["ALL", "UNREAD", "BADGES", "STREAKS"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        filterType === t
                          ? "bg-white/[0.12] text-white font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredNotifs.length > 0 ? (
                    filteredNotifs.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (n.type === "BADGE_UNLOCKED") setActiveTab("achievements");
                          else if (n.type === "STREAK_WARNING") setActiveTab("analytics");
                          else if (n.type === "ANALYSIS_READY") setActiveTab("reports");
                          setIsNotifOpen(false);
                        }}
                        className={`group cursor-pointer rounded-2xl border p-3 transition-all duration-200 ${
                          !n.isRead
                            ? "bg-white/[0.04] border-white/[0.12] hover:border-brand-500/40"
                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2.5">
                            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08]">
                              {getNotifIcon(n.type)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-snug">{n.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(n._id, e)}
                              title="Mark as read"
                              className="text-slate-500 hover:text-emerald-400 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications in this category.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("studio")}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-neon-cyan px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-95 hover:shadow-glow-cyan active:scale-95"
          >
            <Mic className="h-4 w-4" />
            <span>Record / Upload</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-2 rounded-xl border border-white/[0.1] bg-white/[0.04] p-1.5 pr-3 hover:bg-white/[0.08] transition"
          >
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="h-7 w-7 rounded-lg object-cover border border-white/[0.15]"
            />
            <span className="hidden lg:inline text-xs font-medium text-slate-200">
              {user?.name || "Elena Vance"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
