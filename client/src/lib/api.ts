import { ISession, IUser, IGoal, IAchievement, IReport } from "../types";

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

async function handleResponseError(res: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage;
  try {
    const errorJson = await res.json();
    message = errorJson.error?.message || errorJson.message || fallbackMessage;
  } catch {
    // Keep fallbackMessage if response is not JSON
  }
  throw new Error(message);
}

export async function fetchProfile(): Promise<IUser> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/auth/me`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch user profile");
  const json = await res.json();
  return json.data;
}

export async function updateProfile(data: Partial<IUser>): Promise<IUser> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleResponseError(res, "Failed to update profile");
  const json = await res.json();
  return json.data;
}

export async function fetchSessions(): Promise<ISession[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/sessions`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch sessions");
  const json = await res.json();
  if (Array.isArray(json.data)) return json.data;
  if (json.data && Array.isArray(json.data.data)) return json.data.data;
  if (json.data && Array.isArray(json.data.items)) return json.data.items;
  return [];
}

export async function fetchSessionById(id: string): Promise<ISession> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/sessions/${id}`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch session");
  const json = await res.json();
  return json.data;
}

export async function uploadAudioSession(
  audioBlob: Blob,
  fileName: string,
  title: string,
  songTitle: string,
  notes?: string,
  tags?: string[]
): Promise<ISession> {
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

  if (!res.ok) {
    await handleResponseError(res, "Audio upload & analysis failed");
  }

  const json = await res.json();
  return json.data;
}

export async function deleteSession(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) await handleResponseError(res, "Failed to delete session");
}

export async function fetchAnalytics(): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/analytics`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch analytics");
  const json = await res.json();
  return json.data;
}

export async function fetchGoals(): Promise<IGoal[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/goals`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch goals");
  const json = await res.json();
  if (Array.isArray(json.data)) return json.data;
  if (json.data && Array.isArray(json.data.goals)) return json.data.goals;
  return [];
}

export async function createGoal(goal: Partial<IGoal>): Promise<IGoal> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/goals`, {
    method: "POST",
    headers,
    body: JSON.stringify(goal),
  });
  if (!res.ok) await handleResponseError(res, "Failed to create goal");
  const json = await res.json();
  return json.data;
}

export async function toggleGoal(id: string): Promise<IGoal> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/goals/${id}/toggle`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) await handleResponseError(res, "Failed to toggle goal");
  const json = await res.json();
  return json.data;
}

export async function deleteGoal(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) await handleResponseError(res, "Failed to delete goal");
}

export async function fetchAchievements(): Promise<{
  total: number;
  unlockedCount: number;
  unlockedPercentage: number;
  achievements: IAchievement[];
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/achievements`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch achievements");
  const json = await res.json();
  return json.data;
}

export async function fetchReports(): Promise<IReport[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/reports`, { headers });
  if (!res.ok) await handleResponseError(res, "Failed to fetch reports");
  const json = await res.json();
  if (Array.isArray(json.data)) return json.data;
  if (json.data && Array.isArray(json.data.reports)) return json.data.reports;
  return [];
}

export async function generateReport(period: "WEEKLY" | "MONTHLY" | "COMPREHENSIVE"): Promise<IReport> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ period }),
  });
  if (!res.ok) await handleResponseError(res, "Failed to generate report");
  const json = await res.json();
  return json.data;
}
