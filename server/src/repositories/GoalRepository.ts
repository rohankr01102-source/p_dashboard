import { BaseRepository } from "./BaseRepository";
import { IGoalEntity, GoalCategory, GoalFrequency } from "../interfaces/IGoal.interface";
import { IGoalRepository } from "../interfaces/IRepository.interface";
import { Goal, IGoal } from "../models/Goal";
import { memoryStore } from "../services/store";

export class GoalRepository extends BaseRepository<IGoalEntity, IGoal> implements IGoalRepository {
  constructor() {
    super(Goal, memoryStore.goals);
  }

  protected mapToEntity(doc: any): IGoalEntity {
    const targetValue = doc.targetValue || 100;
    const currentValue = doc.currentValue || 0;
    const progressPercentage = doc.progressPercentage || Math.min(100, Math.round((currentValue / targetValue) * 100));

    return {
      id: doc._id?.toString() || doc.id?.toString(),
      userId: doc.userId?.toString() || doc.user?.toString(),
      title: doc.title || "Vocal Goal",
      description: doc.description,
      category: (doc.category || "PITCH_ACCURACY") as GoalCategory,
      frequency: (doc.frequency || "WEEKLY") as GoalFrequency,
      targetValue,
      currentValue,
      unit: doc.unit || "%",
      deadline: (doc.deadline || doc.targetDate) ? new Date(doc.deadline || doc.targetDate) : undefined,
      isCompleted: doc.isCompleted || doc.completed || false,
      completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
      progressPercentage,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
  }

  async findByUserId(userId: string): Promise<IGoalEntity[]> {
    if (this.isDbAvailable()) {
      try {
        const docs = await this.model
          .find({ userId })
          .sort({ isCompleted: 1, createdAt: -1 })
          .lean();
        return docs.map((d) => this.mapToEntity(d));
      } catch (err) {}
    }

    return this.memoryCollection
      .filter((g) => (g.userId || g.user)?.toString() === userId.toString())
      .map((g) => this.mapToEntity(g));
  }

  async findActiveByUserId(userId: string): Promise<IGoalEntity[]> {
    if (this.isDbAvailable()) {
      try {
        const docs = await this.model
          .find({ userId, isCompleted: false })
          .sort({ targetDate: 1, createdAt: -1 })
          .lean();
        return docs.map((d) => this.mapToEntity(d));
      } catch (err) {}
    }

    return this.memoryCollection
      .filter((g) => (g.userId || g.user)?.toString() === userId.toString() && !g.isCompleted && !g.completed)
      .map((g) => this.mapToEntity(g));
  }

  async toggleStatus(id: string, userId: string): Promise<IGoalEntity | null> {
    const goal = await this.findById(id);
    if (!goal || goal.userId.toString() !== userId.toString()) {
      return null;
    }

    const newCompleted = !goal.isCompleted;
    const completedAt = newCompleted ? new Date() : undefined;
    const currentValue = newCompleted ? goal.targetValue : Math.round(goal.targetValue * 0.7);

    return this.update(id, {
      isCompleted: newCompleted,
      completedAt,
      currentValue,
    } as any);
  }

  override async create(item: Partial<IGoalEntity>): Promise<IGoalEntity> {
    const targetDate = (item as any).targetDate || item.deadline;
    return super.create({ ...item, targetDate } as any);
  }

  override async update(id: string, item: Partial<IGoalEntity>): Promise<IGoalEntity | null> {
    const targetDate = (item as any).targetDate || item.deadline;
    return super.update(id, { ...item, ...(targetDate ? { targetDate } : {}) } as any);
  }
}
