export interface SkillRadarMetrics {
  intonation: number;
  stability: number;
  vibrato: number;
  dynamics: number;
  breathControl: number;
  timbreClarity: number;
}

export interface PracticeTrendPoint {
  date: string;
  dayName: string;
  minutes: number;
  sessionsCount: number;
  averageScore: number;
}

export interface DashboardOverviewData {
  stats: {
    totalPracticeMinutes: number;
    totalPracticeHours: number;
    totalRecordings: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    activeGoalsCount: number;
    completedGoalsCount: number;
    vocalType: string;
    vocalRange: string;
  };
  radarMetrics: SkillRadarMetrics;
  practiceTrends: PracticeTrendPoint[];
  recentRecordings: any[];
  recentAnalyses: any[];
}
