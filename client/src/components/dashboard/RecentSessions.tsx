"use client";

import React from "react";
import { Play, Eye, Music, Calendar, Clock, Sparkles, ChevronRight, Mic } from "lucide-react";
import { ISession } from "@/types";
import { formatDuration, formatDate, getScoreColor } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";

interface RecentSessionsProps {
  sessions: ISession[];
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const { setSelectedSession, setActiveTab } = useVocalStore();

  if (!sessions || sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center backdrop-blur-xl">
        <Mic className="mx-auto h-10 w-10 text-slate-500 animate-pulse" />
        <h4 className="mt-3 text-sm font-semibold text-white">No practice sessions logged yet</h4>
        <p className="mt-1 text-xs text-slate-400">
          Record your first vocal take or upload an audio file to receive comprehensive AI feedback.
        </p>
        <button
          onClick={() => setActiveTab("studio")}
          className="mt-4 rounded-xl bg-neon-cyan px-4 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan transition hover:opacity-90"
        >
          Launch Studio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.slice(0, 5).map((session) => {
        const scoreStyle = getScoreColor(session.overallScore);
        return (
          <div
            key={session._id}
            className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.04] shadow-glass"
          >
            {/* Left: Info */}
            <div className="flex items-center space-x-3.5">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600/30 to-neon-cyan/20 border border-white/[0.1]">
                <Music className="h-5 w-5 text-neon-cyan" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                    {session.title}
                  </h4>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {session.songTitle}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-slate-500" />
                    {formatDate(session.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-slate-500" />
                    {formatDuration(session.durationSeconds)}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    Range: {session.lowestNote} - {session.highestNote}
                  </span>
                  {session.vibratoRateHz > 0 && (
                    <span className="text-slate-400">
                      Vibrato: <span className="text-brand-300 font-mono">{session.vibratoRateHz} Hz</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Score Badges & CTA */}
            <div className="flex items-center justify-between md:justify-end space-x-4 border-t border-white/[0.05] pt-3 md:border-t-0 md:pt-0">
              {/* Pitch Accuracy Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pitch Acc.</span>
                <p className="text-xs font-bold text-slate-200 font-mono">
                  {Math.round(session.pitchAccuracyScore)}%
                </p>
              </div>

              {/* Overall Score & Grade */}
              <div
                className={`flex items-center space-x-2 rounded-xl border px-3 py-1.5 ${scoreStyle.bg} ${scoreStyle.border}`}
              >
                <div className="text-right">
                  <div className={`text-base font-extrabold font-mono ${scoreStyle.text}`}>
                    {session.overallScore}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block -mt-0.5">
                    Score
                  </span>
                </div>
                <span
                  className={`rounded-lg bg-black/40 px-2 py-0.5 text-xs font-black ${scoreStyle.text}`}
                >
                  {session.grade}
                </span>
              </div>

              {/* View Deep Analysis CTA */}
              <button
                onClick={() => setSelectedSession(session)}
                className="flex items-center space-x-1 rounded-xl bg-white/[0.06] hover:bg-neon-cyan hover:text-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all hover:shadow-glow-cyan"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span>Analysis</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
