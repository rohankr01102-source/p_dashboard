"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, Volume2, Sparkles, ChevronRight, Sliders } from "lucide-react";
import { mockVocalRange, IMockVocalRange } from "@/lib/mockData";

interface VocalRangeVisualizationProps {
  rangeData?: IMockVocalRange;
}

// All chromatic notes between C3 and A5 for piano keyboard visualization
const chromaticNotes = [
  { note: "C3", freq: 130.81, isSharp: false, register: "Chest" },
  { note: "C#3", freq: 138.59, isSharp: true, register: "Chest" },
  { note: "D3", freq: 146.83, isSharp: false, register: "Chest" },
  { note: "D#3", freq: 155.56, isSharp: true, register: "Chest" },
  { note: "E3", freq: 164.81, isSharp: false, register: "Chest", isTessitura: true },
  { note: "F3", freq: 174.61, isSharp: false, register: "Chest", isTessitura: true },
  { note: "F#3", freq: 185.0, isSharp: true, register: "Chest", isTessitura: true },
  { note: "G3", freq: 196.0, isSharp: false, register: "Chest", isTessitura: true },
  { note: "G#3", freq: 207.65, isSharp: true, register: "Chest", isTessitura: true },
  { note: "A3", freq: 220.0, isSharp: false, register: "Chest", isTessitura: true },
  { note: "A#3", freq: 233.08, isSharp: true, register: "Chest", isTessitura: true },
  { note: "B3", freq: 246.94, isSharp: false, register: "Chest", isTessitura: true },
  { note: "C4", freq: 261.63, isSharp: false, register: "Chest", isTessitura: true },
  { note: "C#4", freq: 277.18, isSharp: true, register: "Chest", isTessitura: true },
  { note: "D4", freq: 293.66, isSharp: false, register: "Chest", isTessitura: true },
  { note: "D#4", freq: 311.13, isSharp: true, register: "Mix", isTessitura: true },
  { note: "E4", freq: 329.63, isSharp: false, register: "Mix", isTessitura: true },
  { note: "F4", freq: 349.23, isSharp: false, register: "Mix", isTessitura: true },
  { note: "F#4", freq: 369.99, isSharp: true, register: "Passaggio", isPassaggio: true, isTessitura: true },
  { note: "G4", freq: 392.0, isSharp: false, register: "Mix", isTessitura: true },
  { note: "G#4", freq: 415.3, isSharp: true, register: "Head", isTessitura: true },
  { note: "A4", freq: 440.0, isSharp: false, register: "Head", isTessitura: true },
  { note: "A#4", freq: 466.16, isSharp: true, register: "Head", isTessitura: true },
  { note: "B4", freq: 493.88, isSharp: false, register: "Head", isTessitura: true },
  { note: "C5", freq: 523.25, isSharp: false, register: "Head", isTessitura: true },
  { note: "C#5", freq: 554.37, isSharp: true, register: "Head" },
  { note: "D5", freq: 587.33, isSharp: false, register: "Head" },
  { note: "D#5", freq: 622.25, isSharp: true, register: "Head" },
  { note: "E5", freq: 659.25, isSharp: false, register: "Head" },
  { note: "F5", freq: 698.46, isSharp: false, register: "Whistle" },
  { note: "F#5", freq: 739.99, isSharp: true, register: "Whistle" },
  { note: "G5", freq: 783.99, isSharp: false, register: "Whistle" },
  { note: "G#5", freq: 830.61, isSharp: true, register: "Whistle" },
  { note: "A5", freq: 880.0, isSharp: false, register: "Whistle" },
];

export const VocalRangeVisualization: React.FC<VocalRangeVisualizationProps> = ({
  rangeData = mockVocalRange,
}) => {
  const [selectedNote, setSelectedNote] = useState(chromaticNotes[18]); // F#4
  const [isPlaying, setIsPlaying] = useState(false);

  // Play synthetic tone using browser Web Audio API
  const playTone = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);

      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 500);
    } catch (e) {
      // AudioContext unavailable in non-browser env
    }
  };

  const handleSelectNote = (noteObj: typeof chromaticNotes[0]) => {
    setSelectedNote(noteObj);
    playTone(noteObj.freq);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-neon-cyan">
              <Music className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Vocal Range & Tessitura Visualizer
            </h3>
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              34 Semitones · 2.83 Octaves
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Interactive piano acoustic spectrum with demonstrated registers, passaggio, and pitch resonance.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-slate-300">
            Span: <strong className="text-white">{rangeData.lowestNote}</strong> &rarr; <strong className="text-neon-cyan">{rangeData.highestNote}</strong>
          </span>
        </div>
      </div>

      {/* Registers Legend Badges */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {rangeData.registers.map((reg, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
          >
            <div
              className="h-2.5 w-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: reg.color }}
            />
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-white truncate">{reg.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {reg.startNote} - {reg.endNote}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Musical Piano Ruler */}
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/40 p-4 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
          <span>Lowest: {rangeData.lowestNote} (130.8 Hz)</span>
          <span className="text-brand-300 font-semibold">Tessitura: {rangeData.tessituraStart} &ndash; {rangeData.tessituraEnd}</span>
          <span>Highest: {rangeData.highestNote} (880.0 Hz)</span>
        </div>

        {/* Piano Keys Ribbon */}
        <div className="relative flex h-24 w-full items-end justify-between overflow-x-auto rounded-xl border border-white/[0.08] bg-[#070b14] p-1.5">
          {chromaticNotes.map((noteObj, idx) => {
            const isSelected = selectedNote.note === noteObj.note;
            const isPassaggio = noteObj.isPassaggio;

            return (
              <button
                key={idx}
                onClick={() => handleSelectNote(noteObj)}
                className={`relative flex flex-1 flex-col items-center justify-end rounded-md transition-all duration-150 mx-0.5 ${
                  noteObj.isSharp
                    ? "h-14 bg-slate-900 border border-slate-700 hover:bg-slate-800"
                    : "h-20 bg-slate-200/90 border border-white/20 hover:bg-white text-slate-900"
                } ${
                  isSelected
                    ? "!bg-neon-cyan !border-neon-cyan shadow-glow-cyan text-slate-950 font-bold scale-105 z-20"
                    : ""
                } ${
                  isPassaggio && !isSelected
                    ? "!border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    : ""
                }`}
              >
                {/* Note Label */}
                <span
                  className={`text-[9px] font-mono leading-none mb-1 ${
                    noteObj.isSharp ? "text-slate-400" : "text-slate-800"
                  } ${isSelected ? "!text-slate-950 font-extrabold" : ""}`}
                >
                  {noteObj.note.replace("#", "♯")}
                </span>

                {/* Passaggio Dot */}
                {isPassaggio && (
                  <span className="absolute -top-2 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Note Inspector Card */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => playTone(selectedNote.freq)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan hover:scale-110 active:scale-95 transition-all shadow-glow-cyan ${
                isPlaying ? "animate-pulse !bg-neon-cyan !text-slate-950" : ""
              }`}
              title="Play reference tone"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-white font-mono">
                  {selectedNote.note}
                </span>
                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono">
                  {selectedNote.freq.toFixed(2)} Hz
                </span>
                <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300">
                  {selectedNote.register} Register
                </span>
                {selectedNote.isPassaggio && (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    Primary Primo Passaggio
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Click any piano key above to trigger Web Audio oscillator frequency preview.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Tessitura Status</span>
            <p className="text-xs font-bold text-emerald-400">
              {selectedNote.isTessitura ? "Inside Optimal Comfort Zone" : "Outer Expressive Extension"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
