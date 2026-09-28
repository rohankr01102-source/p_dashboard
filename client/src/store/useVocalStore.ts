import { create } from "zustand";
import { ISession, IUser, IGoal, IAchievement, IReport } from "../types";

export type NavTab =
  | "dashboard"
  | "analytics"
  | "recordings"
  | "sessions"
  | "goals"
  | "achievements"
  | "profile"
  | "settings"
  | "studio"
  | "reports";

interface VocalState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  user: IUser | null;
  setUser: (user: IUser) => void;

  selectedSession: ISession | null;
  setSelectedSession: (session: ISession | null) => void;

  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;

  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;

  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisStep: string;
  setAnalysisStep: (step: string) => void;

  notification: { message: string; type: "success" | "error" | "info" } | null;
  showNotification: (message: string, type?: "success" | "error" | "info") => void;
  clearNotification: () => void;
}

// Module-level timer handle so it can be cancelled across renders.
let _notificationTimer: ReturnType<typeof setTimeout> | null = null;

export const useVocalStore = create<VocalState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  user: null,
  setUser: (user) => set({ user }),

  selectedSession: null,
  setSelectedSession: (session) => set({ selectedSession: session }),

  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),

  audioBlob: null,
  setAudioBlob: (blob) => set({ audioBlob: blob }),

  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  analysisStep: "",
  setAnalysisStep: (step) => set({ analysisStep: step }),

  notification: null,
  showNotification: (message, type = "success") => {
    // Cancel any pending auto-dismiss before scheduling a new one.
    if (_notificationTimer !== null) {
      clearTimeout(_notificationTimer);
      _notificationTimer = null;
    }
    set({ notification: { message, type } });
    _notificationTimer = setTimeout(() => {
      _notificationTimer = null;
      set({ notification: null });
    }, 4500);
  },
  clearNotification: () => {
    if (_notificationTimer !== null) {
      clearTimeout(_notificationTimer);
      _notificationTimer = null;
    }
    set({ notification: null });
  },
}));
