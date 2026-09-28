"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Eye,
  Trash2,
  Music,
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Volume2,
} from "lucide-react";
import { ISession } from "@/types";
import { mockSessions } from "@/lib/mockData";
import { formatDuration, formatDate, getScoreColor } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";

interface RecentRecordingsTableProps {
  sessions?: ISession[];
  onRefresh?: () => void;
}

export const RecentRecordingsTable: React.FC<RecentRecordingsTableProps> = ({
  sessions = mockSessions,
  onRefresh,
}) => {
  const { setSelectedSession, setActiveTab, showNotification } = useVocalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === id) {
      setPlayingId(null);
      showNotification("Audio preview paused", "info");
    } else {
      setPlayingId(id);
      showNotification("Audio preview playing...", "info");
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.songTitle && s.songTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag =
      selectedTag === "ALL" || (s.tags && s.tags.includes(selectedTag));
    return matchesQuery && matchesTag;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-neon-cyan">
              <Music className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Recordings & Vocal Archive
            </h3>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-300">
              {filteredSessions.length} Takes
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            High-fidelity takes with microtonal intonation curves and DSP feedback logs.
          </p>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
            {["ALL", "Classical", "Pop", "Belt", "Warm-up"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  selectedTag === tag
                    ? "bg-brand-600 text-white font-bold shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab("recordings")}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] transition"
          >
            View All Archive
          </button>
        </div>
      </div>

      {/* High Density Linear / Stripe Style Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/20">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Track / Piece</th>
              <th className="py-3 px-3">Date & Duration</th>
              <th className="py-3 px-3">Pitch Acc.</th>
              <th className="py-3 px-3">Tempo (BPM)</th>
              <th className="py-3 px-3">Overall Score</th>
              <th className="py-3 px-3">AI Diagnostic</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredSessions.slice(0, 6).map((session) => {
              const isPlaying = playingId === session._id;
              const scoreStyle = getScoreColor(session.overallScore);

              return (
                <tr
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className="group cursor-pointer transition-colors duration-150 hover:bg-white/[0.03]"
                >
                  {/* Track Info & Inline Play Button */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => togglePlay(session._id, e)}
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
                          isPlaying
                            ? "bg-neon-cyan border-neon-cyan text-slate-950 shadow-glow-cyan"
                            : "border-white/[0.1] bg-white/[0.03] text-slate-300 hover:scale-105 hover:border-neon-cyan hover:text-white"
                        }`}
                        title={isPlaying ? "Pause preview" : "Play preview"}
                      >
                        {isPlaying ? (
                          <div className="flex items-center space-x-0.5">
                            <span className="h-3 w-0.5 bg-slate-950 animate-wave-bar" />
                            <span className="h-4 w-0.5 bg-slate-950 animate-wave-bar delay-75" />
                            <span className="h-2 w-0.5 bg-slate-950 animate-wave-bar delay-150" />
                          </div>
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white group-hover:text-neon-cyan transition-colors truncate">
                            {session.title}
                          </span>
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                            {session.tags?.[0] || "Take"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {session.songTitle} &bull; <span className="font-mono text-cyan-300">{session.lowestNote}-{session.highestNote}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date & Duration */}
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    <div>{formatDate(session.createdAt)}</div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </td>

                  {/* Pitch Accuracy */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-neon-cyan">
                      {Math.round(session.pitchAccuracyScore)}%
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      &plusmn;{session.centsDeviationAvg}c
                    </span>
                  </td>

                  {/* Tempo (BPM) */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono text-indigo-300 font-semibold">
                      {120} BPM
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      vibrato: {session.vibratoRateHz} Hz
                    </span>
                  </td>

                  {/* Overall Score */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5">
                      <span className={`font-mono font-extrabold ${scoreStyle.text}`}>
                        {session.overallScore}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-black border ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}
                      >
                        {session.grade}
                      </span>
                    </div>
                  </td>

                  {/* AI Diagnostic Pill */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[10px] font-medium text-cyan-300">
                      {session.timbreClarityScore > 93
                        ? "Pristine Intonation"
                        : "Stable Resonance"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                      }}
                      className="inline-flex items-center space-x-1 rounded-xl bg-white/[0.04] hover:bg-neon-cyan hover:text-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 border border-white/[0.08] transition-all"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span>Analysis</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
