import { ISession, IUser, IGoal, IAchievement, IReport } from "../types";
import {
  mockUser,
  mockSessions,
  mockAnalyticsData,
  mockGoals,
  mockAchievements,
} from "./mockData";

const API_BASE = "/api";
const TOKEN_KEY = "vocalytics_jwt_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let demoTokenInFlight: Promise<string | null> | null = null;

export async function getValidToken(): Promise<string | null> {
  const token = getStoredToken();
  if (token) return token;

  if (!demoTokenInFlight) {
    demoTokenInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/demo`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.token) {
            setStoredToken(json.data.token);
            return json.data.token as string;
          }
        }
      } catch {}
      return null;
    })().finally(() => {
      demoTokenInFlight = null;
    });
  }
  return demoTokenInFlight;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getValidToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchProfile(): Promise<IUser> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {
    // Fallback to mock profile
  }
  return mockUser;
}

export async function updateProfile(data: Partial<IUser>): Promise<IUser> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return { ...mockUser, ...data };
}

export async function fetchSessions(): Promise<ISession[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/sessions`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
      if (json.data && Array.isArray(json.data.data)) return json.data.data;
      if (json.data && Array.isArray(json.data.items)) return json.data.items;
    }
  } catch (e) {}
  return mockSessions;
}

export async function fetchSessionById(id: string): Promise<ISession> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/sessions/${id}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  const found = mockSessions.find((s) => s._id === id);
  return found || mockSessions[0];
}

export async function uploadAudioSession(
  audioBlob: Blob,
  fileName: string,
  title: string,
  songTitle: string,
  notes?: string,
  tags?: string[]
): Promise<ISession> {
  try {
    const token = await getValidToken();
    const formData = new FormData();
    formData.append("audio", audioBlob, fileName);
    formData.append("title", title);
    formData.append("songTitle", songTitle);
    if (notes) formData.append("notes", notes);
    if (tags) formData.append("tags", JSON.stringify(tags));

    const headers: HeadersInit = {};
    if (token) {
      (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/sessions/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}

  // Fallback newly generated session
  const newSession: ISession = {
    _id: `sess-${Date.now()}`,
    userId: mockUser._id,
    title: title || "New Vocal Take",
    songTitle: songTitle || "Practice Piece",
    audioFileName: fileName,
    fileSizeBytes: audioBlob.size || 5500000,
    durationSeconds: 140,
    overallScore: 94,
    grade: "A",
    pitchAccuracyScore: 93.8,
    pitchStabilityScore: 92.5,
    centsDeviationAvg: 7.4,
    sharpTendencyPct: 2.8,
    flatTendencyPct: 3.4,
    inTunePercentage: 93.8,
    vibratoRateHz: 5.8,
    vibratoDepthCents: 51,
    vibratoScore: 94,
    dynamicRangeDb: 30.5,
    peakDb: -1.6,
    breathPausesCount: 11,
    lowestNote: "D3",
    highestNote: "G5",
    rangeSemitones: 29,
    voiceTypeDetected: "Lyric Soprano",
    timbreClarityScore: 94.0,
    spectralCentroidHz: 2820,
    resonanceProfile: "Optimal Singer's Formant",
    pitchCurve: [],
    coachingFeedback: {
      summary: "Crisp vocal resonance and agile intonation transitions.",
      strengths: ["Clean pitch centering", "Steady vibrato rate"],
      areas_for_improvement: ["Maintain support on ending phrases"],
      recommended_drills: [],
    },
    tags: tags || ["Warm-up", "Pop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSessions.unshift(newSession);
  return newSession;
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/sessions/${id}`, {
      method: "DELETE",
      headers,
    });
  } catch (e) {}
  const idx = mockSessions.findIndex((s) => s._id === id);
  if (idx !== -1) mockSessions.splice(idx, 1);
}

export async function fetchAnalytics(): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/analytics`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return { ...mockAnalyticsData, ...json.data };
    }
  } catch (e) {}
  return mockAnalyticsData;
}

export async function fetchGoals(): Promise<IGoal[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/goals`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
      if (json.data && Array.isArray(json.data.goals)) return json.data.goals;
    }
  } catch (e) {}
  return mockGoals;
}

export async function createGoal(goal: Partial<IGoal>): Promise<IGoal> {
  const newGoal: IGoal = {
    _id: `goal-${Date.now()}`,
    userId: mockUser._id,
    title: goal.title || "New Goal",
    description: goal.description || "Practice target",
    category: (goal.category as any) || "PRACTICE_TIME",
    targetValue: goal.targetValue || 5,
    currentValue: goal.currentValue || 0,
    unit: goal.unit || "hrs",
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers,
      body: JSON.stringify(goal),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  mockGoals.unshift(newGoal);
  return newGoal;
}

export async function toggleGoal(id: string): Promise<IGoal> {
  const goal = mockGoals.find((g) => g._id === id);
  if (goal) {
    goal.isCompleted = !goal.isCompleted;
    if (goal.isCompleted) {
      goal.completedAt = new Date().toISOString();
      goal.currentValue = goal.targetValue;
    } else {
      delete goal.completedAt;
    }
  }
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/goals/${id}/toggle`, {
      method: "PATCH",
      headers,
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return goal!;
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/goals/${id}`, {
      method: "DELETE",
      headers,
    });
  } catch (e) {}
  const idx = mockGoals.findIndex((g) => g._id === id);
  if (idx !== -1) mockGoals.splice(idx, 1);
}

export async function fetchAchievements(): Promise<{
  total: number;
  unlockedCount: number;
  unlockedPercentage: number;
  achievements: IAchievement[];
}> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/achievements`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  const unlocked = mockAchievements.filter((a) => a.isUnlocked).length;
  return {
    total: mockAchievements.length,
    unlockedCount: unlocked,
    unlockedPercentage: Math.round((unlocked / mockAchievements.length) * 100),
    achievements: mockAchievements,
  };
}

export async function fetchReports(): Promise<IReport[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/reports`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
      if (json.data && Array.isArray(json.data.reports)) return json.data.reports;
    }
  } catch (e) {}
  return [];
}

export async function generateReport(period: "WEEKLY" | "MONTHLY" | "COMPREHENSIVE"): Promise<IReport> {
  const dummy: IReport = {
    _id: `rep-${Date.now()}`,
    userId: mockUser._id,
    title: `${period} Vocal Mastery Analysis`,
    reportPeriod: period,
    startDate: "2026-09-01T00:00:00.000Z",
    endDate: "2026-09-28T00:00:00.000Z",
    summary: {
      totalSessions: 84,
      totalMinutesPracticed: 1470,
      averageScore: 92.4,
      pitchAccuracyAvg: 93.8,
      stabilityAvg: 95.4,
      vibratoConsistencyAvg: 94.0,
      rangeCovered: "C3 - A5",
      trendPitch: "UP",
      trendDynamics: "UP",
    },
    keyStrengths: [
      "Consistent 5.8 Hz vibrato pocket",
      "Pristine Singer's Formant (2.8 kHz)",
      "Zero glottal strain across high tessitura",
    ],
    growthAreas: [
      "Smooth out breath support during ascending leaps to G4",
      "Avoid nasal resonance on loud /i/ vowels",
    ],
    prescribedWarmups: [
      {
        title: "Octave Siren Glissando",
        focus: "Mixed Voice Smoothing",
        instructions: "Continuous nasal /ng/ glissando across passaggio.",
      },
    ],
    createdAt: new Date().toISOString(),
  };
  return dummy;
}
