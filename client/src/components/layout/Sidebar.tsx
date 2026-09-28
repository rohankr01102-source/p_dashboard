"use client";

import React from "react";
import {
  LayoutDashboard,
  LineChart,
  Disc3,
  Target,
  Award,
  UserCheck,
  Settings,
  Mic2,
  Cpu,
  Sparkles,
  Layers,
  ChevronRight,
  Calendar,
  FileText,
} from "lucide-react";
import { useVocalStore, NavTab } from "@/store/useVocalStore";
import { cn } from "@/lib/utils";

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Practice Analytics", icon: LineChart },
  { id: "calendar", label: "Practice Calendar", icon: Calendar, badge: "Heatmap" },
  { id: "recordings", label: "Recordings", icon: Disc3, badge: "84 Takes" },
  { id: "goals", label: "Goals", icon: Target },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "reports", label: "Health Reports", icon: FileText },
  { id: "profile", label: "Profile", icon: UserCheck },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "studio", label: "Live Audio Studio", icon: Mic2, badge: "DSP Live" },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useVocalStore();

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-white/[0.08] bg-[#090d16]/95 backdrop-blur-2xl p-4">
      {/* Navigation Links */}
      <div className="space-y-6">
        {/* Workspace Quick Header */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-neon-cyan font-bold text-xs">
              V
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">Elena&apos;s Studio</div>
              <div className="text-[10px] text-slate-500 leading-none mt-1">Vocal Coach Pro</div>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Navigation
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === "recordings" && activeTab === "sessions");
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-brand-600/25 to-neon-cyan/15 text-white border border-brand-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] font-bold"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-neon-cyan" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold border",
                        item.badge.includes("Live")
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse"
                          : "bg-white/[0.06] text-slate-400 border-white/[0.08]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-neon-cyan animate-spin-slow" />
              <span className="text-[11px] font-semibold text-slate-200">
                DSP Audio Engine
              </span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
            Librosa YIN Pitch Tracker, Vibrato FFT Spectrum & Formant Resonance Active
          </p>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] text-slate-400">
            <span>DSP Latency</span>
            <span className="text-emerald-400 font-mono font-semibold">18ms</span>
          </div>
        </div>
      </div>

      {/* Pro Plan Card */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 to-brand-900/10 p-3.5 shadow-glass">
        <div className="flex items-center space-x-2 text-brand-300">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <span className="text-xs font-bold text-white">Vocal Coach AI Pro</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-300 leading-normal">
          Unlimited practice track uploads, formant tuning & weekly progress report exports.
        </p>
      </div>
    </aside>
  );
};
