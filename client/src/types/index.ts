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

export interface IStreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  streakFreezesRemaining: number;
  isPracticedToday: boolean;
  streakStatus: "ACTIVE" | "AT_RISK" | "FROZEN" | "BROKEN";
  nextMilestoneDays: number;
  daysToNextMilestone: number;
  streakHistory: Array<{ date: string; practiced: boolean; minutes: number }>;
}

export interface IPersonalBestItem {
  id: string;
  metric: string;
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  achievedAt: string;
  sessionTitle?: string;
  description: string;
  tier: "Gold" | "Diamond" | "Platinum";
}

export interface IPersonalBestsResponse {
  records: IPersonalBestItem[];
  totalRecordsBroken: number;
  lastUpdated: string;
}

export interface ISuggestedWarmup {
  id: string;
  title: string;
  focus: string;
  durationMinutes: number;
  instructions: string;
  benefit: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface IWeakArea {
  id: string;
  areaTitle: string;
  severity: "LOW" | "MODERATE" | "HIGH";
  metricImpacted: string;
  diagnosticObservation: string;
  impactExplanation: string;
  prescribedRemedy: string;
}

export interface ISmartRecommendationsResponse {
  suggestedDuration: {
    recommendedMinutes: number;
    intensity: "Light Recovery" | "Balanced Workout" | "High Performance";
    rationale: string;
    fatigueRiskLevel: "Low" | "Moderate" | "Elevated";
  };
  suggestedWarmups: ISuggestedWarmup[];
  weakAreas: IWeakArea[];
  vocalHealthTip: string;
  lastAnalyzedAt: string;
}

export interface ICalendarDaySession {
  id: string;
  title: string;
  durationMinutes: number;
  overallScore: number;
  pitchAccuracy: number;
  tags: string[];
}

export interface ICalendarDay {
  date: string;
  dayNumber: number;
  dayOfWeek: number;
  minutesPracticed: number;
  sessionCount: number;
  averageScore: number | null;
  intensity: 0 | 1 | 2 | 3 | 4;
  sessions: ICalendarDaySession[];
  isToday: boolean;
  isFuture: boolean;
}

export interface ICalendarMonthResponse {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  activeDaysCount: number;
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  consistencyRate: number;
  days: ICalendarDay[];
}

export interface IEmailPreferences {
  weeklyDigest: boolean;
  monthlyReport: boolean;
  streakAlerts: boolean;
  achievementAlerts: boolean;
  emailAddress?: string;
}

export interface IEmailPreviewResponse {
  subject: string;
  html: string;
  text: string;
  data: {
    userName: string;
    email: string;
    totalMinutes: number;
    streakDays: number;
    avgScore: number;
    avgPitch: number;
    topSessionTitle: string;
  };
}

