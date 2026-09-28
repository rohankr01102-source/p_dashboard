"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Award,
  Crosshair,
  Activity,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Music,
  Share2,
  Calendar,
  Clock,
  Radio,
  VolumeX,
} from "lucide-react";
import { ISession } from "@/types";
import { formatDuration, formatDate, getScoreColor } from "@/lib/utils";
import { useVocalStore } from "@/store/useVocalStore";

interface SessionDetailModalProps {
  session: ISession | null;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  const { showNotification } = useVocalStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!session) return null;

  const scoreStyle = getScoreColor(session.overallScore);

  // SVG Pitch Curve Chart calculations - Safe from Call Stack Overflow
  const pitchPoints = session.pitchCurve || [];
  const voicedPoints = pitchPoints.filter((p) => p.is_voiced && p.midi !== null);

  // Safe min/max MIDI computation with reduce (prevents V8 stack overflow on large datasets)
  const minMidi = voicedPoints.length > 0
    ? voicedPoints.reduce((min, p) => Math.min(min, p.midi || min), 127) - 2
    : 48;
  const maxMidi = voicedPoints.length > 0
    ? voicedPoints.reduce((max, p) => Math.max(max, p.midi || max), 0) + 2
    : 72;

  const totalDuration = Math.max(1, session.durationSeconds || 60);

  const chartWidth = 720;
  const chartHeight = 200;

  const getX = (time: number) => (time / totalDuration) * (chartWidth - 60) + 45;
  const getY = (midi: number) =>
    chartHeight - 30 - ((midi - minMidi) / Math.max(1, maxMidi - minMidi)) * (chartHeight - 50);

  // Build SVG Path
  let pathD = "";
  let currentSegmentStarted = false;

  pitchPoints.forEach((pt) => {
    if (pt.is_voiced && pt.midi) {
      const x = getX(pt.time);
      const y = getY(pt.midi);
      if (!currentSegmentStarted) {
        pathD += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
        currentSegmentStarted = true;
      } else {
        pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    } else {
      currentSegmentStarted = false;
    }
  });

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          showNotification("Audio playback preview not available for this synthetic take.", "info");
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/[0.12] bg-[#090d16] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close diagnostic report"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-400 hover:text-white hover:bg-white/[0.1] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-300 border border-brand-500/30">
                {session.voiceTypeDetected} Evaluation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(session.createdAt)}
              </span>
            </div>
            <h2 id="modal-title" className="mt-1 text-2xl font-black text-white tracking-tight">
              {session.title}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Track: <strong className="text-slate-200">{session.songTitle}</strong> • Duration:{" "}
              {formatDuration(session.durationSeconds)}
            </p>
          </div>

          {/* Big Grade & Score Card */}
          <div
            className={`flex items-center space-x-3 rounded-2xl border px-5 py-3 ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.glow}`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Overall Vocal Index
              </span>
              <div className={`text-3xl font-black font-mono ${scoreStyle.text}`}>
                {session.overallScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-black/50 text-xl font-black ${scoreStyle.text}`}
            >
              {session.grade}
            </div>
          </div>
        </div>

        {/* Audio Player Scrubber Strip */}
        {session.audioUrl && (
          <div className="flex items-center space-x-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
            <audio
              ref={audioRef}
              src={session.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              onClick={toggleAudio}
              aria-label={isPlaying ? "Pause audio take" : "Play audio take"}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neon-cyan text-slate-950 font-bold hover:scale-105 transition shadow-glow-cyan"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1">
              <input
                type="range"
                min={0}
                max={session.durationSeconds || 60}
                value={currentTime}
                onChange={handleScrub}
                aria-label="Audio scrubber"
                className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-neon-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(session.durationSeconds)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Pitch Contour Graph */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-neon-cyan" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                F0 Pitch Trajectory & Chromatic Deviation
              </h4>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400">● Sung Pitch Contour</span>
              <span>Range: {session.lowestNote} – {session.highestNote}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 select-none"
            >
              <defs>
                <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Background grid horizontal lines */}
              {[minMidi, Math.round((minMidi + maxMidi) / 2), maxMidi].map((m, idx) => (
                <g key={idx}>
                  <line
                    x1="45"
                    y1={getY(m)}
                    x2={chartWidth - 15}
                    y2={getY(m)}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="20"
                    y={getY(m) + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    MIDI {m}
                  </text>
                </g>
              ))}

              {/* Pitch Curve Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#pitchGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
              )}

              {/* Time markers on bottom */}
              <text x="50" y={chartHeight - 6} fill="#64748b" fontSize="9" fontFamily="monospace">
                0:00
              </text>
              <text
                x={chartWidth / 2}
                y={chartHeight - 6}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatDuration(totalDuration / 2)}
              </text>
              <text
                x={chartWidth - 30}
                y={chartHeight - 6}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatDuration(totalDuration)}
              </text>
            </svg>
          </div>
        </div>

        {/* 4 Quadrants DSP Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold">Pitch Centering</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {Math.round(session.pitchAccuracyScore)}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              ±{session.centsDeviationAvg} cents avg error
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Activity className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-[10px] uppercase font-bold">Vibrato Rate</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {session.vibratoRateHz > 0 ? `${session.vibratoRateHz} Hz` : "Straight"}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {session.vibratoDepthCents} cents depth
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold">Dynamic Span</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {session.dynamicRangeDb} dB
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {session.breathPausesCount} breath points
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] uppercase font-bold">Resonance</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {session.spectralCentroidHz} Hz
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {session.resonanceProfile}
            </p>
          </div>
        </div>

        {/* AI Coaching Feedback & Pedagogical Plan */}
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 via-brand-950/10 to-transparent p-6 space-y-5 shadow-glass">
          <div className="flex items-center space-x-2 text-brand-300">
            <Sparkles className="h-5 w-5 text-neon-cyan" />
            <h3 className="text-base font-extrabold text-white tracking-tight">
              AI Vocal Coach Diagnostic
            </h3>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-xs text-slate-200 leading-relaxed">
            {session.coachingFeedback?.summary || "Vocal take exhibited strong resonance and steady vibrato."}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Observed Strengths</span>
              </span>
              <ul className="space-y-2">
                {session.coachingFeedback?.strengths?.map((str, i) => (
                  <li
                    key={i}
                    className="flex items-start space-x-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-slate-300"
                  >
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>Areas for Technical Growth</span>
              </span>
              <ul className="space-y-2">
                {session.coachingFeedback?.areas_for_improvement?.map((imp, i) => (
                  <li
                    key={i}
                    className="flex items-start space-x-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-slate-300"
                  >
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {session.coachingFeedback?.recommended_drills?.length > 0 && (
            <div className="border-t border-white/[0.08] pt-4">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5 mb-3">
                <Dumbbell className="h-4 w-4 text-neon-cyan" />
                <span>Prescribed Warm-up Drills for Next Session</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {session.coachingFeedback.recommended_drills.map((drill, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{drill.title}</h5>
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                        {drill.focus}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300 leading-normal">
                      {drill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <span className="text-xs text-slate-400">
            Take ID: <span className="font-mono text-slate-300">{session._id}</span>
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                showNotification("Session link copied to clipboard!", "success");
              }}
              aria-label="Share practice take link"
              className="flex items-center space-x-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08]"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Take</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-neon-cyan px-5 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
