"use client";

import React, { useState } from "react";
import { Search, Filter, Trash2, Eye, Plus, Calendar, Clock, Music } from "lucide-react";
import { ISession } from "@/types";
import { formatDuration, formatDate, getScoreColor } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";
import { deleteSession } from "@/lib/api";

interface SessionsListViewProps {
  sessions: ISession[];
  onRefresh?: () => void;
}

export const SessionsListView: React.FC<SessionsListViewProps> = ({ sessions, onRefresh }) => {
  const { setSelectedSession, setActiveTab, showNotification } = useVocalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("ALL");

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.songTitle && s.songTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === "ALL" || (s.tags && s.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this vocal recording?")) {
      try {
        await deleteSession(id);
        showNotification("Session removed.", "info");
        if (onRefresh) onRefresh();
      } catch (err: any) {
        showNotification("Failed to delete session", "error");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Vocal Practice Archive ({sessions.length})
          </h2>
          <p className="text-xs text-slate-400">
            Browse all historical singing takes, pitch trajectories, and personalized drill logs.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-4 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Practice Take</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by song name or exercise title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["ALL", "Warm-up", "Pop", "Rock", "Agility"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                selectedTag === tag
                  ? "bg-brand-600 text-white shadow-glow"
                  : "border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => {
          const scoreStyle = getScoreColor(session.overallScore);
          return (
            <div
              key={session._id}
              onClick={() => setSelectedSession(session)}
              className="group cursor-pointer relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition hover:border-brand-500/40 hover:bg-white/[0.04] shadow-glass space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {session.songTitle}
                  </span>
                  <h4 className="mt-1.5 text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                    {session.title}
                  </h4>
                  <div className="mt-1 flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-slate-500" />
                      {formatDate(session.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3 text-slate-500" />
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* Score & Grade */}
                <div
                  className={`flex items-center space-x-2 rounded-xl border px-3 py-1.5 ${scoreStyle.bg} ${scoreStyle.border}`}
                >
                  <span className={`text-base font-black font-mono ${scoreStyle.text}`}>
                    {session.overallScore}
                  </span>
                  <span
                    className={`rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-black ${scoreStyle.text}`}
                  >
                    {session.grade}
                  </span>
                </div>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">Intonation</span>
                  <span className="font-mono font-bold text-slate-200">
                    {Math.round(session.pitchAccuracyScore)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Vibrato</span>
                  <span className="font-mono font-bold text-brand-300">
                    {session.vibratoRateHz > 0 ? `${session.vibratoRateHz} Hz` : "Straight"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Span</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {session.lowestNote} – {session.highestNote}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                  {session.coachingFeedback?.summary || "Analyzed with Vocalytics DSP"}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleDelete(session._id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex items-center space-x-1 rounded-xl bg-neon-cyan/10 hover:bg-neon-cyan px-2.5 py-1 text-[11px] font-semibold text-neon-cyan hover:text-slate-950 transition">
                    <Eye className="h-3 w-3 mr-0.5" />
                    <span>View AI Report</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
