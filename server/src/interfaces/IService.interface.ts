import { RegisterDTO, LoginDTO, AuthResponse, JwtPayload } from "../types/auth.types";
import { AudioUploadMetadata } from "../types/audio.types";
import { DashboardOverviewData, SkillRadarMetrics, PracticeTrendPoint } from "../types/dashboard.types";
import { IUserEntity, IUserPreferences } from "./IUser.interface";
import { IRecordingEntity } from "./IRecording.interface";
import { IAnalysisEntity } from "./IAnalysis.interface";
import { IGoalEntity, GoalCategory, GoalFrequency } from "./IGoal.interface";
import { INotificationEntity } from "./INotification.interface";
import { PaginationOptions, PaginatedResult } from "../types/common.types";

export interface IAuthService {
  register(dto: RegisterDTO): Promise<AuthResponse>;
  login(dto: LoginDTO): Promise<AuthResponse>;
  getDemoUser(): Promise<AuthResponse>;
  verifyToken(token: string): Promise<JwtPayload>;
  generateToken(payload: JwtPayload): string;
  getUserById(id: string): Promise<IUserEntity | null>;
}

export interface IUploadService {
  processUpload(file: Express.Multer.File, userId: string, title?: string, tags?: string[]): Promise<IRecordingEntity>;
  deleteAudioFile(filePath: string): Promise<boolean>;
  getAudioMetadata(filePath: string): Promise<Partial<AudioUploadMetadata>>;
}

export interface IAnalysisService {
  analyzeRecording(recordingId: string, userId: string): Promise<IAnalysisEntity>;
  getAnalysisByRecording(recordingId: string, userId: string): Promise<IAnalysisEntity | null>;
  getUserAnalyses(userId: string, limit?: number): Promise<IAnalysisEntity[]>;
  getProgressTimeline(userId: string, days?: number): Promise<any[]>;
  getIntonationSummary(userId: string): Promise<Record<string, any>>;
}

export interface IDashboardService {
  getOverview(userId: string): Promise<DashboardOverviewData>;
  getSkillRadar(userId: string): Promise<SkillRadarMetrics>;
  getPracticeTrends(userId: string, days?: number): Promise<PracticeTrendPoint[]>;
  getRecentActivity(userId: string, limit?: number): Promise<any[]>;
}

export interface IGoalService {
  getUserGoals(userId: string): Promise<IGoalEntity[]>;
  getGoalById(id: string, userId: string): Promise<IGoalEntity | null>;
  createGoal(
    userId: string,
    data: {
      title: string;
      description?: string;
      category: GoalCategory;
      frequency: GoalFrequency;
      targetValue: number;
      unit: string;
      deadline?: Date;
    }
  ): Promise<IGoalEntity>;
  updateGoal(id: string, userId: string, data: Partial<IGoalEntity>): Promise<IGoalEntity | null>;
  toggleGoal(id: string, userId: string): Promise<IGoalEntity | null>;
  deleteGoal(id: string, userId: string): Promise<boolean>;
}

export interface IUserService {
  getProfile(userId: string): Promise<IUserEntity | null>;
  updateProfile(userId: string, data: Partial<IUserEntity>): Promise<IUserEntity | null>;
  updatePreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserEntity | null>;
  getUserStats(userId: string): Promise<Record<string, any>>;
  getLeaderboard(limit?: number): Promise<IUserEntity[]>;
}

export interface INotificationService {
  getUserNotifications(userId: string, limit?: number): Promise<INotificationEntity[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<INotificationEntity>;
}

export interface IRecordingService {
  getAllRecordings(userId: string, pagination: PaginationOptions): Promise<PaginatedResult<IRecordingEntity> | IRecordingEntity[]>;
  getRecordingById(id: string, userId: string): Promise<IRecordingEntity>;
  updateRecording(id: string, userId: string, updateData: Partial<IRecordingEntity>): Promise<IRecordingEntity>;
  deleteRecording(id: string, userId: string): Promise<boolean>;
  getStorageStats(userId: string): Promise<any>;
}
