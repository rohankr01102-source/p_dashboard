"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Cpu,
  Sparkles,
  Sliders,
  CreditCard,
  Key,
  Shield,
  Check,
  Download,
  ExternalLink,
  Volume2,
  Mic,
  Moon,
  Laptop,
  CheckCircle2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useVocalStore } from "@/store/useVocalStore";
import { updateProfile } from "@/lib/api";

type SettingsTab = "account" | "audio" | "ai" | "appearance" | "billing" | "api";

export const SettingsView: React.FC = () => {
  const { user, setUser, showNotification } = useVocalStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Form states
  const [name, setName] = useState(user?.name || "Elena Vance");
  const [email, setEmail] = useState(user?.email || "elena.vance@vocalytics.ai");
  const [voiceType, setVoiceType] = useState<string>(user?.voiceType || "Lyric Soprano");
  const [skillLevel, setSkillLevel] = useState<string>(user?.skillLevel || "Advanced");
  const [sampleRate, setSampleRate] = useState("48000");
  const [pitchThreshold, setPitchThreshold] = useState("440");
  const [aiStrictness, setAiStrictness] = useState<"standard" | "strict" | "lenient">("standard");
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [noiseGate, setNoiseGate] = useState(-42);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        name,
        email,
        voiceType: voiceType as any,
        skillLevel: skillLevel as any,
      });
      setUser(updated);
      showNotification("Account settings saved successfully.", "success");
    } catch (e) {
      showNotification("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("vcl_live_948f93b827f8491a92e104b9c");
    setApiKeyCopied(true);
    showNotification("API key copied to clipboard", "success");
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: "account", label: "Singer Profile", icon: User },
    { id: "audio", label: "Audio & DSP Engine", icon: Mic },
    { id: "ai", label: "AI Coach & Pedagogy", icon: Sparkles },
    { id: "appearance", label: "Theme & Display", icon: Moon },
    { id: "billing", label: "Billing & Subscription", icon: CreditCard },
    { id: "api", label: "API & Developers", icon: Key },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300">
            <Settings className="h-5 w-5 text-neon-cyan" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs text-slate-400">
              Manage your singer profile, audio DSP engine, AI coach strictness, and SaaS subscription.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Layout with Tabbed Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex w-full items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-600/20 text-white border border-brand-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-neon-cyan" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane (9 Cols) */}
        <div className="lg:col-span-9">
          {/* TAB 1: Singer Profile */}
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">Singer Profile</h3>
                <p className="text-xs text-slate-400">
                  Update your public display identity and vocal classification attributes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Voice Type / Fach Classification
                  </label>
                  <select
                    value={voiceType}
                    onChange={(e) => setVoiceType(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="Lyric Soprano">Lyric Soprano</option>
                    <option value="Coloratura Soprano">Coloratura Soprano</option>
                    <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                    <option value="Contralto">Contralto</option>
                    <option value="Countertenor">Countertenor</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Baritone">Baritone</option>
                    <option value="Bass">Bass</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Experience / Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="Beginner">Beginner (1-2 years)</option>
                    <option value="Intermediate">Intermediate (3-5 years)</option>
                    <option value="Advanced">Advanced (Conservative/Semi-Pro)</option>
                    <option value="Professional">Professional Artist</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.06]">
                <button
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="rounded-xl bg-neon-cyan px-4 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSaving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Audio & DSP Engine */}
          {activeTab === "audio" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">Audio & DSP Hardware Engine</h3>
                <p className="text-xs text-slate-400">
                  Configure hardware audio input, sampling precision, and pitch tracking sensitivity.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Audio Input Microphone Device
                  </label>
                  <select className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none">
                    <option>Shure SM7B - Focusrite Scarlett 2i2 USB</option>
                    <option>Blue Yeti USB Microphone</option>
                    <option>Rode NT1-A - Audio Interface</option>
                    <option>Default Built-in Laptop Microphone</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Sample Rate Calibration
                    </label>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    >
                      <option value="44100">44.1 kHz (Standard Audio CD)</option>
                      <option value="48000">48.0 kHz (Studio Reference · Recommended)</option>
                      <option value="96000">96.0 kHz (Audiophile High-Res)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Concert Pitch Reference
                    </label>
                    <select
                      value={pitchThreshold}
                      onChange={(e) => setPitchThreshold(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    >
                      <option value="440">A4 = 440.0 Hz (International Standard)</option>
                      <option value="442">A4 = 442.0 Hz (European Orchestral)</option>
                      <option value="432">A4 = 432.0 Hz (Verdi / Mathematical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">
                      DSP Noise Gate Threshold: {noiseGate} dB
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Silences room rumble</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="-20"
                    value={noiseGate}
                    onChange={(e) => setNoiseGate(Number(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => showNotification("Audio DSP calibrated and locked.", "success")}
                  className="rounded-xl bg-neon-cyan px-4 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition"
                >
                  Save Audio DSP
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI Coaching & Pedagogy */}
          {activeTab === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">AI Coach & Pedagogical Intelligence</h3>
                <p className="text-xs text-slate-400">
                  Tune algorithmic feedback sensitivity and diagnostic drill suggestions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Intonation Evaluation Strictness
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "lenient", label: "Lenient", desc: "±15 cents tolerance" },
                      { id: "standard", label: "Standard", desc: "±8 cents studio tolerance" },
                      { id: "strict", label: "Conservatory", desc: "±4 cents professional" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setAiStrictness(mode.id as any)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          aiStrictness === mode.id
                            ? "border-neon-cyan bg-cyan-500/10 text-white shadow-glow-cyan"
                            : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div>
                    <span className="text-xs font-bold text-white">
                      Automated Pedagogical Drill Generation
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Suggest targeted scales and vocalises based on identified pitch breaks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAnalyze}
                    onChange={(e) => setAutoAnalyze(e.target.checked)}
                    className="h-4 w-4 rounded accent-neon-cyan cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => showNotification("AI coaching profile updated.", "success")}
                  className="rounded-xl bg-neon-cyan px-4 py-2 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition"
                >
                  Save AI Preferences
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Theme & Appearance */}
          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">Theme & Dashboard Appearance</h3>
                <p className="text-xs text-slate-400">
                  Select dashboard color accents, glassmorphic blur intensity, and table density.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-neon-cyan/50 bg-cyan-500/10 p-4 text-center cursor-pointer shadow-glow-cyan">
                  <div className="h-8 w-full rounded-lg bg-[#090d16] border border-neon-cyan/30 mb-2" />
                  <span className="text-xs font-bold text-white">Midnight Cyber</span>
                  <p className="text-[10px] text-neon-cyan mt-0.5">Default Linear Theme</p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center cursor-pointer hover:border-white/20">
                  <div className="h-8 w-full rounded-lg bg-[#0f172a] border border-white/10 mb-2" />
                  <span className="text-xs font-bold text-slate-300">Obsidian Slate</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Deep Charcoal</p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center cursor-pointer hover:border-white/20">
                  <div className="h-8 w-full rounded-lg bg-[#18181b] border border-white/10 mb-2" />
                  <span className="text-xs font-bold text-slate-300">Monochrome Zinc</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Minimalist Contrast</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: Billing & SaaS Subscription */}
          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">SaaS Subscription & Invoices</h3>
                <p className="text-xs text-slate-400">
                  Manage your plan, storage limits, and Stripe customer billing portal.
                </p>
              </div>

              {/* Plan Card */}
              <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 to-cyan-950/40 p-5 shadow-glass">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-neon-cyan/20 px-2.5 py-0.5 text-[10px] font-bold text-neon-cyan border border-neon-cyan/30">
                      ACTIVE SUBSCRIPTION
                    </span>
                    <h4 className="mt-2 text-lg font-black text-white">Vocal Coach Pro Tier</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      $29.00 / month &bull; Renews on October 28, 2026 via Stripe
                    </p>
                  </div>
                  <button
                    onClick={() => showNotification("Redirecting to Stripe Billing Portal...", "info")}
                    className="flex items-center space-x-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-200 transition"
                  >
                    <span>Manage in Stripe</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/[0.08] pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Cloud Storage</span>
                    <p className="font-bold text-white font-mono">1.4 GB / 50.0 GB (3%)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">DSP Audio Takes</span>
                    <p className="font-bold text-white font-mono">Unlimited</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Weekly PDF Reports</span>
                    <p className="font-bold text-neon-cyan font-mono">Unlocked</p>
                  </div>
                </div>
              </div>

              {/* Invoice History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Billing Invoices
                </h4>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04] text-xs">
                  {[
                    { id: "INV-2026-009", date: "Sep 28, 2026", amount: "$29.00", status: "Paid" },
                    { id: "INV-2026-008", date: "Aug 28, 2026", amount: "$29.00", status: "Paid" },
                    { id: "INV-2026-007", date: "Jul 28, 2026", amount: "$29.00", status: "Paid" },
                  ].map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3">
                      <div>
                        <span className="font-mono font-semibold text-white">{inv.id}</span>
                        <span className="text-[11px] text-slate-500 ml-2">{inv.date}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-200">{inv.amount}</span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {inv.status}
                        </span>
                        <button
                          onClick={() => showNotification(`Downloaded ${inv.id}.pdf`, "success")}
                          className="text-slate-400 hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: API & Developers */}
          {activeTab === "api" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-6 backdrop-blur-xl shadow-glass"
            >
              <div>
                <h3 className="text-sm font-bold text-white">Developer API Keys & Webhooks</h3>
                <p className="text-xs text-slate-400">
                  Authenticate requests from external DAWs, audio plugins, or export services.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Production Secret API Key
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    readOnly
                    value="vcl_live_948f93b827f8491a92e104b9c"
                    className="flex-1 rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-2 font-mono text-xs text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={copyApiKey}
                    className="flex items-center space-x-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] transition"
                  >
                    {apiKeyCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{apiKeyCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Audio Analysis Webhook Endpoint
                </label>
                <input
                  type="text"
                  placeholder="https://api.yourdomain.com/webhooks/vocal-analysis"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
