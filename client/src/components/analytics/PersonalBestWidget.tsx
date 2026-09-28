"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Sparkles, Target, Music, Zap, Flame, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPersonalBests } from "@/lib/api";
import { IPersonalBestsResponse, IPersonalBestItem } from "@/types";

export const PersonalBestWidget: React.FC = () => {
  const { data: pbData, isLoading } = useQuery<IPersonalBestsResponse>({
    queryKey: ["personalBests"],
    queryFn: fetchPersonalBests,
    staleTime: 60 * 1000,
  });

  const records = pbData?.records || [];

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "PITCH_ACCURACY":
        return Target;
      case "RANGE_SPAN":
      case "HIGHEST_NOTE":
        return Music;
      case "VIBRATO_STABILITY":
        return Zap;
      case "DAILY_STREAK":
        return Flame;
      case "PRACTICE_VOLUME":
        return Clock;
      default:
        return Trophy;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]";
      case "Diamond":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c1220]/80 p-6 backdrop-blur-2xl shadow-glass space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Personal Best Records</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">All-time vocal milestones achieved in your practice career</p>
          </div>
        </div>

        <span className="rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-xs font-mono font-bold text-amber-400">
          {records.length} Records Set
        </span>
      </div>

      {/* Grid of Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {records.map((item, idx) => {
          const Icon = getMetricIcon(item.metric);
          const formattedDate = new Date(item.achievedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 group-hover:text-amber-400 group-hover:border-amber-500/30 transition">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${getTierBadge(item.tier)}`}>
                    {item.tier}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-400">{item.label}</div>
                <div className="text-xl font-black text-white font-mono mt-0.5 tracking-tight group-hover:text-amber-300 transition">
                  {item.value}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[130px] text-slate-400">{item.sessionTitle || "Vocal Take"}</span>
                <span className="font-mono">{formattedDate}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
