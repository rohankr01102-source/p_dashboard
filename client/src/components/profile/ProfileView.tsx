"use client";

import React, { useState } from "react";
import {
  User,
  Music,
  Sliders,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mic,
  Award,
} from "lucide-react";
import { IUser } from "@/types";
import { updateProfile } from "@/lib/api";
import { useVocalStore } from "@/store/useVocalStore";

interface ProfileViewProps {
  user: IUser | null;
  onRefresh?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onRefresh }) => {
  const { setUser, showNotification } = useVocalStore();

  const [name, setName] = useState(user?.name || "Elena Vance");
  const [bio, setBio] = useState(
    user?.bio || "Contemporary pop & musical theater vocalist. Focusing on chest-to-head mix blending and vibrato control."
  );
  const [voiceType, setVoiceType] = useState<any>(user?.voiceType || "Tenor");
  const [skillLevel, setSkillLevel] = useState<any>(user?.skillLevel || "Advanced");
  const [lowestNote, setLowestNote] = useState(user?.vocalRangeLowest || "C3");
  const [highestNote, setHighestNote] = useState(user?.vocalRangeHighest || "A4");
  const [micDevice, setMicDevice] = useState(
    user?.preferences?.audioInputDevice || "Shure SM7B Vocal Mic"
  );
  const [isSaving, setIsSaving] = useState(false);

  const voiceClassifications = [
    { name: "Bass", range: "E2 – E4", desc: "Low resonant male register" },
    { name: "Baritone", range: "A2 – A4", desc: "Warm, flexible mid male register" },
    { name: "Tenor", range: "C3 – C5", desc: "High bright male register" },
    { name: "Contralto", range: "F3 – F5", desc: "Deep rich female register" },
    { name: "Mezzo-Soprano", range: "A3 – A5", desc: "Expressive middle female register" },
    { name: "Soprano", range: "C4 – C6", desc: "High clear female register" },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await updateProfile({
        name,
        bio,
        voiceType,
        skillLevel,
        vocalType: voiceType,
        experienceLevel: skillLevel,
        vocalRangeLowest: lowestNote,
        vocalRangeHighest: highestNote,
        preferences: {
          darkTheme: true,
          autoAnalyze: true,
          audioInputDevice: micDevice,
          notifications: true,
        },
      });

      setUser(updated);
      showNotification("Profile updated successfully!", "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showNotification("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
            <User className="h-4 w-4 text-neon-cyan" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Singer Profile & Vocal Fach Calibration
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Personalize your vocal identity, vocal range limits, gear calibration, and practice preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl shadow-glass space-y-4"
          >
            <div className="flex items-center space-x-4 border-b border-white/[0.06] pb-4">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                }
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover border-2 border-neon-cyan/40 shadow-glow"
              />
              <div>
                <h3 className="text-base font-bold text-white">{name}</h3>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  {voiceType} • {skillLevel}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Singer Bio & Goals
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Voice Classification (Fach)
                </label>
                <select
                  value={voiceType}
                  onChange={(e) => setVoiceType(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1322] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                >
                  <option value="Soprano">Soprano</option>
                  <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                  <option value="Contralto">Contralto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Baritone">Baritone</option>
                  <option value="Bass">Bass</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Proficiency Tier
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1322] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                >
                  <option value="Beginner">Beginner (0 - 1 years)</option>
                  <option value="Intermediate">Intermediate (1 - 3 years)</option>
                  <option value="Advanced">Advanced (3 - 6 years)</option>
                  <option value="Professional">Professional (Studio/Stage)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Lowest Sustained Note
                </label>
                <input
                  type="text"
                  value={lowestNote}
                  onChange={(e) => setLowestNote(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white font-mono focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Highest Sustained Note
                </label>
                <input
                  type="text"
                  value={highestNote}
                  onChange={(e) => setHighestNote(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white font-mono focus:border-neon-cyan focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Audio Hardware Device
              </label>
              <input
                type="text"
                value={micDevice}
                onChange={(e) => setMicDevice(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-5 py-2.5 text-xs font-bold text-slate-950 shadow-glow-cyan hover:opacity-90 transition"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
            </button>
          </form>
        </div>

        {/* Right: Vocal Ranges Reference Card (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl shadow-glass space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Music className="h-4 w-4 text-brand-400" />
              <span>Vocal Range Architecture</span>
            </h4>
            <p className="text-xs text-slate-400">
              Standard classical and contemporary vocal fach spans:
            </p>

            <div className="space-y-2 mt-3">
              {voiceClassifications.map((vt) => {
                const isCurrent = vt.name === voiceType;
                return (
                  <div
                    key={vt.name}
                    className={`rounded-2xl border p-3 transition ${
                      isCurrent
                        ? "border-neon-cyan/50 bg-neon-cyan/10"
                        : "border-white/[0.05] bg-white/[0.01]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isCurrent ? "text-neon-cyan" : "text-white"}`}>
                        {vt.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-300">{vt.range}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{vt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <h5 className="text-xs font-bold text-white">Vocal Fold Health Status</h5>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              No chronic strain or hyper-adduction detected in recent frequency spectrums. Formant brightness indicates clear laryngeal positioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
