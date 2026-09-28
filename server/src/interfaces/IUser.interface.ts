export interface IUserPreferences {
  darkTheme: boolean;
  autoAnalyze: boolean;
  audioInputDevice: string;
  notifications: boolean;
  emailDigest?: boolean;
}

export interface IUserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
  vocalType: string;
  experienceLevel: string;
  preferredGenres: string[];
  totalPracticeHours: number;
  totalPracticeMinutes?: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  preferences: IUserPreferences;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}
