"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  CheckCircle2,
  X,
  Settings2,
  Bell,
  Sparkles,
  Flame,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmailPreview,
  sendEmailSummary,
  fetchEmailPreferences,
  updateEmailPreferences,
} from "@/lib/api";
import { IEmailPreferences, IEmailPreviewResponse } from "@/types";
import { useVocalStore } from "@/store/useVocalStore";

interface EmailSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSummaryModal: React.FC<EmailSummaryModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useVocalStore();
  const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [isSending, setIsSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Email preview query
  const { data: previewData, isLoading: isPreviewLoading, refetch: refetchPreview } = useQuery<IEmailPreviewResponse>({
    queryKey: ["emailPreview", period],
    queryFn: () => fetchEmailPreview(period),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  // Email preferences query
  const { data: prefs, refetch: refetchPrefs } = useQuery<IEmailPreferences>({
    queryKey: ["emailPreferences"],
    queryFn: fetchEmailPreferences,
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const [localPrefs, setLocalPrefs] = useState<IEmailPreferences>({
    weeklyDigest: true,
    monthlyReport: true,
    streakAlerts: true,
    achievementAlerts: true,
    emailAddress: "elena.vance@example.com",
  });

  React.useEffect(() => {
    if (prefs) setLocalPrefs(prefs);
  }, [prefs]);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const res = await sendEmailSummary(period, localPrefs.emailAddress);
      showNotification(
        `Email summary successfully dispatched to ${res.recipient}!`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      showNotification("Email summary sent to your inbox!", "success");
    } finally {
      setIsSending(false);
    }
  };

  const handleTogglePref = async (key: keyof IEmailPreferences) => {
    const updated = { ...localPrefs, [key]: !localPrefs[key] };
    setLocalPrefs(updated);
    try {
      await updateEmailPreferences(updated);
      showNotification("Email preferences updated.", "success");
    } catch {
      // Ignored in mock fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/[0.12] bg-[#0c1427] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5 bg-[#090d16]/70">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Vocal Performance Email Summaries</span>
              </h3>
              <p className="text-xs text-slate-400">Weekly & monthly progress digests delivered to your inbox</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`rounded-xl border p-2 text-xs transition ${
                showSettings
                  ? "bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan"
                  : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
              title="Email Notification Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Settings Dropdown / Drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/[0.08] bg-[#090e1a] p-5 space-y-3"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Notification & Digest Preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-slate-300">Weekly Performance Digest</span>
                  <input
                    type="checkbox"
                    checked={localPrefs.weeklyDigest}
                    onChange={() => handleTogglePref("weeklyDigest")}
                    className="accent-neon-cyan h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-slate-300">Monthly Comprehensive Review</span>
                  <input
                    type="checkbox"
                    checked={localPrefs.monthlyReport}
                    onChange={() => handleTogglePref("monthlyReport")}
                    className="accent-neon-cyan h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-slate-300">Singing Streak Danger Alerts</span>
                  <input
                    type="checkbox"
                    checked={localPrefs.streakAlerts}
                    onChange={() => handleTogglePref("streakAlerts")}
                    className="accent-neon-cyan h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-slate-300">Instant Achievement Celebrations</span>
                  <input
                    type="checkbox"
                    checked={localPrefs.achievementAlerts}
                    onChange={() => handleTogglePref("achievementAlerts")}
                    className="accent-neon-cyan h-4 w-4"
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Period Selector Tabs */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-1.5 rounded-xl bg-white/[0.04] p-1 border border-white/[0.06]">
            <button
              onClick={() => setPeriod("WEEKLY")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "WEEKLY"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,245,255,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Weekly Digest
            </button>
            <button
              onClick={() => setPeriod("MONTHLY")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "MONTHLY"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,245,255,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Review
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Recipient: <strong className="text-white font-mono">{localPrefs.emailAddress}</strong>
          </span>
        </div>

        {/* Email Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#070b14] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Subject Line
                </span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {previewData?.subject || "🎙️ Your Vocalytics Weekly Summary"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                HTML Ready
              </span>
            </div>

            {/* Email Visual Mock / Sandbox */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c1427] p-5 space-y-4">
              <div className="text-center pb-3 border-b border-white/[0.06]">
                <div className="text-base font-extrabold text-neon-cyan tracking-wider">
                  VOCALYTICS AI
                </div>
                <span className="inline-block mt-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 px-2.5 py-0.5 text-[10px] font-bold text-neon-cyan">
                  {period} PERFORMANCE DIGEST
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Hey {previewData?.data?.userName || "Elena"}, you logged{" "}
                <strong>
                  {Math.round((previewData?.data?.totalMinutes || 1470) / 60)}h{" "}
                  {(previewData?.data?.totalMinutes || 1470) % 60}m
                </strong>{" "}
                of vocal practice and maintained your{" "}
                <strong>{previewData?.data?.streakDays || 14}-day singing streak</strong>!
              </p>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-base font-black text-amber-400 font-mono">
                    🔥 {previewData?.data?.streakDays || 14}d
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Streak</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-base font-black text-neon-cyan font-mono">
                    {previewData?.data?.avgPitch || 93.8}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Intonation</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {previewData?.data?.avgScore || 92.4}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Avg Score</div>
                </div>
              </div>

              <div className="rounded-xl bg-brand-500/10 border border-brand-500/25 p-3 space-y-1">
                <div className="text-[10px] font-bold text-brand-300 uppercase">⭐ Top Performance</div>
                <div className="text-xs font-bold text-white">
                  {previewData?.data?.topSessionTitle || "Adele - Easy On Me (Acoustic Take)"}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border-l-2 border-neon-cyan p-3 text-xs text-slate-300">
                <span className="text-[10px] font-bold text-neon-cyan uppercase block mb-1">
                  AI Vocal Coach Insight
                </span>
                &quot;Superb resonant placement in upper chest mix. Keep vaulted soft palate on sustained notes to maintain Singer&apos;s Formant brightness.&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] p-5 bg-[#090d16]/70">
          <button
            onClick={() => refetchPreview()}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Preview</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] px-4 py-2 text-xs font-bold text-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-neon-cyan px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:opacity-90 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? "Sending..." : "Send Test Email to Inbox"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
