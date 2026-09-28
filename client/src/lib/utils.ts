import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  if (score >= 90) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    };
  }
  if (score >= 80) {
    return {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    };
  }
  if (score >= 70) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    };
  }
  return {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
  };
}
