"use client";

import React from "react";
import {
  LayoutDashboard,
  Mic2,
  Library,
  LineChart,
  Target,
  Award,
  FileText,
  UserCheck,
} from "lucide-react";
import { useVocalStore, NavTab } from "@/store/useVocalStore";
import { cn } from "@/lib/utils";

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useVocalStore();

  const items = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "studio", label: "Studio", icon: Mic2 },
    { id: "analytics", label: "Analytics", icon: LineChart },
    { id: "goals", label: "Goals", icon: Target },
    { id: "profile", label: "Profile", icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/[0.08] bg-[#090d16]/95 px-2 backdrop-blur-2xl lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as NavTab)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 py-1 text-[10px] font-medium transition",
              isActive ? "text-neon-cyan font-bold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition",
                isActive ? "bg-neon-cyan/15 text-neon-cyan" : ""
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
