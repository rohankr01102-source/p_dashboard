import { IUserEntity } from "./IUser.interface";
import { IRecordingEntity } from "./IRecording.interface";
import { IAnalysisEntity } from "./IAnalysis.interface";
import { IGoalEntity } from "./IGoal.interface";
import { INotificationEntity } from "./INotification.interface";
import { PaginationOptions, PaginatedResult } from "../types/common.types";

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  find(filter?: Record<string, any>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Record<string, any>): Promise<number>;
}

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  findByEmail(email: string): Promise<IUserEntity | null>;
  findByEmailWithPassword(email: string): Promise<IUserEntity | null>;
  findUsersWithActiveStreak(): Promise<IUserEntity[]>;
  updatePracticeStats(userId: string, additionalMinutes: number): Promise<IUserEntity | null>;
  updateStreak(userId: string, newStreak: number, longestStreak: number): Promise<IUserEntity | null>;
  getLeaderboard(limit?: number): Promise<IUserEntity[]>;
  getUserStatistics(userId: string): Promise<Record<string, any>>;
}

export interface IRecordingRepository extends IBaseRepository<IRecordingEntity> {
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<IRecordingEntity>>;
  findWithAnalysis(userId: string, limit?: number): Promise<any[]>;
  getStorageUsage(userId: string): Promise<{ totalBytes: number; totalMB: number; fileCount: number }>;
  softDelete(id: string): Promise<boolean>;
}

export interface IAnalysisRepository extends IBaseRepository<IAnalysisEntity> {
  findByRecordingId(recordingId: string): Promise<IAnalysisEntity | null>;
  findByUserId(userId: string, limit?: number): Promise<IAnalysisEntity[]>;
  getRecentAverages(userId: string, limit?: number): Promise<Record<string, number>>;
  getProgressTimeline(userId: string, days?: number): Promise<any[]>;
}

export interface IGoalRepository extends IBaseRepository<IGoalEntity> {
  findByUserId(userId: string): Promise<IGoalEntity[]>;
  findActiveByUserId(userId: string): Promise<IGoalEntity[]>;
  toggleStatus(id: string, userId: string): Promise<IGoalEntity | null>;
}

export interface INotificationRepository extends IBaseRepository<INotificationEntity> {
  findByUserId(userId: string, limit?: number): Promise<INotificationEntity[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
}
