"use client";

import React from "react";
import { motion } from "framer-motion";
import { HardDrive, Upload, ArrowUpRight, Music2, FileAudio } from "lucide-react";
import { useVocalStore } from "@/store/useVocalStore";

interface UploadCountCardProps {
  totalUploads?: number;
  weeklyUploads?: number;
  storageUsedBytes?: number;
  storageMaxBytes?: number;
}

export const UploadCountCard: React.FC<UploadCountCardProps> = ({
  totalUploads = 84,
  weeklyUploads = 8,
  storageUsedBytes = 1488977920, // 1.39 GB
  storageMaxBytes = 5368709120, // 5.0 GB
}) => {
  const { setActiveTab } = useVocalStore();

  const usedGb = (storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const maxGb = (storageMaxBytes / (1024 * 1024 * 1024)).toFixed(1);
  const storagePct = Math.round((storageUsedBytes / storageMaxBytes) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#0f172a]/80"
    >
      {/* Top cyan glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
            <FileAudio className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Upload Count
            </span>
            <p className="text-[10px] text-slate-500">Audio library archive</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center space-x-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
        >
          <span>+{weeklyUploads} new</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      {/* Main KPI display */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {totalUploads}
            </span>
            <span className="text-sm font-semibold text-slate-400">Takes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            High-res <strong className="text-slate-200">24-bit WAV / FLAC</strong> storage
          </p>
        </div>

        {/* Quick upload CTA */}
        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center space-x-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-neon-cyan hover:text-slate-950 transition-all shadow-sm"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Storage Progress Bar */}
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center">
            <HardDrive className="mr-1 h-3 w-3 text-slate-500" />
            Cloud Storage: {usedGb} / {maxGb} GB
          </span>
          <span className="font-mono font-bold text-cyan-300">{storagePct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${storagePct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>
    </motion.div>
  );
};
