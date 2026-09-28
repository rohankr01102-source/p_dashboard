"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Calendar,
  Clock,
  Music,
  Play,
  Pause,
  Download,
  ArrowUpDown,
  Sparkles,
  Volume2,
} from "lucide-react";
import { ISession } from "@/types";
import { formatDuration, formatDate, getScoreColor } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";
import { deleteSession } from "@/lib/api";
import { mockSessions } from "@/lib/mockData";

interface RecordingsViewProps {
  sessions?: ISession[];
  onRefresh?: () => void;
}

export const RecordingsView: React.FC<RecordingsViewProps> = ({
  sessions = mockSessions,
  onRefresh,
}) => {
  const { setSelectedSession, setActiveTab, showNotification } = useVocalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "score" | "accuracy">("date");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const effectiveSessions = sessions && sessions.length > 0 ? sessions : mockSessions;

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === id) {
      setPlayingId(null);
      showNotification("Playback stopped.", "info");
    } else {
      setPlayingId(id);
      showNotification("Streaming audio take preview...", "info");
    }
  };

  const filtered = effectiveSessions
    .filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.songTitle && s.songTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag =
        selectedTag === "ALL" || (s.tags && s.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.overallScore - a.overallScore;
      if (sortBy === "accuracy") return b.pitchAccuracyScore - a.pitchAccuracyScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this vocal recording take?")) {
      try {
        await deleteSession(id);
        showNotification("Recording removed from archive.", "info");
        if (onRefresh) onRefresh();
      } catch (e) {
        showNotification("Failed to delete recording", "error");
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Music className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Vocal Recordings Archive ({filtered.length})
              </h2>
              <p className="text-xs text-slate-400">
                Studio audio takes with pitch trajectories, vibrato FFT, and acoustic diagnostic logs.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-4 py-2.5 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Take</span>
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search takes by song title or vocalise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none backdrop-blur-xl"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Tag Filter */}
          <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
            {["ALL", "Classical", "Pop", "Belt", "Warm-up", "Agility"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedTag === tag
                    ? "bg-brand-600 text-white font-bold shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-white/[0.08] bg-[#0c1220] px-3 py-2 text-xs font-semibold text-slate-300 focus:border-neon-cyan focus:outline-none"
          >
            <option value="date">Sort: Most Recent</option>
            <option value="score">Sort: Highest Score</option>
            <option value="accuracy">Sort: Pitch Accuracy</option>
          </select>
        </div>
      </div>

      {/* Grid of Recordings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((session) => {
          const isPlaying = playingId === session._id;
          const scoreStyle = getScoreColor(session.overallScore);

          return (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedSession(session)}
              className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-brand-500/40 hover:bg-[#0f172a]/90"
            >
              {/* Top row: Audio Play Button, Title, and Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={(e) => togglePlay(session._id, e)}
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
                      isPlaying
                        ? "bg-neon-cyan border-neon-cyan text-slate-950 shadow-glow-cyan"
                        : "border-white/[0.1] bg-white/[0.04] text-slate-200 hover:scale-105 hover:border-neon-cyan hover:text-white"
                    }`}
                    title={isPlaying ? "Pause" : "Play preview"}
                  >
                    {isPlaying ? (
                      <div className="flex items-center space-x-0.5">
                        <span className="h-3 w-0.5 bg-slate-950 animate-wave-bar" />
                        <span className="h-4 w-0.5 bg-slate-950 animate-wave-bar delay-75" />
                        <span className="h-2 w-0.5 bg-slate-950 animate-wave-bar delay-150" />
                      </div>
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {session.songTitle} &bull; <span className="font-mono text-cyan-300">{session.lowestNote} - {session.highestNote}</span>
                    </p>
                  </div>
                </div>

                {/* Score Badge */}
                <div
                  className={`flex items-center space-x-1.5 rounded-xl border px-2.5 py-1 ${scoreStyle.bg} ${scoreStyle.border}`}
                >
                  <span className={`text-sm font-black font-mono ${scoreStyle.text}`}>
                    {session.overallScore}
                  </span>
                  <span className={`rounded px-1 text-[10px] font-black ${scoreStyle.text}`}>
                    {session.grade}
                  </span>
                </div>
              </div>

              {/* Waveform graphic mockup */}
              <div className="mt-4 flex h-6 w-full items-center justify-between gap-1 px-1">
                {Array.from({ length: 32 }).map((_, i) => {
                  const height = 20 + Math.sin(i * 0.4) * 50 + (i % 3) * 15;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        isPlaying
                          ? "bg-neon-cyan shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                          : "bg-white/[0.1] group-hover:bg-brand-400/40"
                      }`}
                      style={{ height: `${Math.max(15, Math.min(100, height))}%` }}
                    />
                  );
                })}
              </div>

              {/* Bottom metadata & action row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center font-mono">
                    <Clock className="mr-1 h-3 w-3 text-slate-500" />
                    {formatDuration(session.durationSeconds)}
                  </span>
                  <span className="flex items-center font-mono">
                    <Calendar className="mr-1 h-3 w-3 text-slate-500" />
                    {formatDate(session.createdAt)}
                  </span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {Math.round(session.pitchAccuracyScore)}% Intonation
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session);
                    }}
                    className="flex items-center space-x-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-slate-200 hover:bg-neon-cyan hover:text-slate-950 transition font-semibold"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span>Analysis</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(session._id, e)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition"
                    title="Delete take"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
