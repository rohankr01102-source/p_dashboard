export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  vocalType?: "Soprano" | "Mezzo-Soprano" | "Contralto" | "Countertenor" | "Tenor" | "Baritone" | "Bass" | "Unclassified";
  voiceType?: "Soprano" | "Mezzo-Soprano" | "Contralto" | "Tenor" | "Baritone" | "Bass" | "Unclassified";
  experienceLevel?: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  skillLevel?: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  bio?: string;
  vocalRangeLowest?: string;
  vocalRangeHighest?: string;
  preferredGenres?: string[];
  totalPracticeHours?: number;
  totalPracticeMinutes: number;
  totalSessionsCount: number;
  averageScore: number;
  currentStreak?: number;
  longestStreak?: number;
  streakDays: number;
  lastPracticeDate?: string;
  preferences: {
    darkTheme: boolean;
    autoAnalyze: boolean;
    audioInputDevice?: string;
    notifications: boolean;
  };
}

export interface IPitchPoint {
  time: number;
  frequency: number | null;
  midi: number | null;
  note: string | null;
  is_voiced: boolean;
}

export interface IDrill {
  title: string;
  focus: string;
  description: string;
}

export interface ICoachingFeedback {
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_drills: IDrill[];
}

export interface ISession {
  _id: string;
  userId: string;
  title: string;
  songTitle?: string;
  audioUrl?: string;
  audioFileName: string;
  fileSizeBytes: number;
  durationSeconds: number;
  overallScore: number;
  grade: string;
  pitchAccuracyScore: number;
  pitchStabilityScore: number;
  centsDeviationAvg: number;
  sharpTendencyPct: number;
  flatTendencyPct: number;
  inTunePercentage: number;
  vibratoRateHz: number;
  vibratoDepthCents: number;
  vibratoScore: number;
  dynamicRangeDb: number;
  peakDb: number;
  breathPausesCount: number;
  lowestNote: string;
  highestNote: string;
  rangeSemitones: number;
  voiceTypeDetected: string;
  timbreClarityScore: number;
  spectralCentroidHz: number;
  resonanceProfile: string;
  pitchCurve: IPitchPoint[];
  coachingFeedback: ICoachingFeedback;
  userNotes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IGoal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: "PRACTICE_TIME" | "PITCH_ACCURACY" | "RANGE_EXPANSION" | "VIBRATO_STABILITY" | "DAILY_STREAK" | "REPERTOIRE";
  targetValue: number;
  currentValue: number;
  targetPracticeHours?: number;
  targetPitchAccuracy?: number;
  targetSessions?: number;
  completionPercentage?: number;
  unit: string;
  deadline?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface IAchievement {
  _id: string;
  userId: string;
  badgeKey: string;
  title: string;
  description: string;
  icon: string;
  category: "INTONATION" | "RANGE" | "DEDICATION" | "VIBRATO" | "MILESTONE" | "COMMUNITY";
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
}

export interface IReport {
  _id: string;
  userId: string;
  title: string;
  reportPeriod: "WEEKLY" | "MONTHLY" | "COMPREHENSIVE";
  startDate: string;
  endDate: string;
  summary: {
    totalSessions: number;
    totalMinutesPracticed: number;
    averageScore: number;
    pitchAccuracyAvg: number;
    stabilityAvg: number;
    vibratoConsistencyAvg: number;
    rangeCovered: string;
    trendPitch: "UP" | "DOWN" | "STEADY";
    trendDynamics: "UP" | "DOWN" | "STEADY";
  };
  keyStrengths: string[];
  growthAreas: string[];
  prescribedWarmups: Array<{
    title: string;
    focus: string;
    instructions: string;
  }>;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "PRACTICE_REMINDER" | "GOAL_ACHIEVED" | "ANALYSIS_READY" | "STREAK_WARNING" | "BADGE_UNLOCKED" | "FEEDBACK_RECEIVED" | "SYSTEM_ANNOUNCEMENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface IFeedback {
  _id: string;
  recordingId: string;
  userId: string;
  authorType: "AI_COACH" | "VERIFIED_COACH" | "PEER_SINGER" | "SELF_REVIEW";
  overallRating: number;
  aspectRatings: {
    pitchAccuracy: number;
    breathControl: number;
    toneQuality: number;
    vocalAgility: number;
    emotionalDelivery: number;
  };
  writtenFeedback: string;
  actionableTips: string[];
  createdAt: string;
}

export interface IPlaylistItem {
  recordingId: string;
  order: number;
  addedAt: string;
  notes?: string;
}

export interface IPlaylist {
  _id: string;
  userId: string;
  title: string;
  description: string;
  coverImage?: string;
  items: IPlaylistItem[];
  isPublic: boolean;
  tags: string[];
  playCount: number;
  createdAt: string;
}

export interface IPracticeSchedule {
  _id: string;
  userId: string;
  title: string;
  frequency: "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";
  daysOfWeek: number[];
  preferredTime: string;
  durationMinutes: number;
  reminderEnabled: boolean;
  focusArea: string;
  isActive: boolean;
}
