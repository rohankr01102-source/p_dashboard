import { IGoalService } from "../interfaces/IService.interface";
import { IGoalRepository } from "../interfaces/IRepository.interface";
import { IGoalEntity, GoalCategory, GoalFrequency } from "../interfaces/IGoal.interface";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "../utils/appError";
import { Logger } from "../utils/logger";

export class GoalService implements IGoalService {
  constructor(private readonly goalRepo: IGoalRepository) {}

  async getUserGoals(userId: string): Promise<IGoalEntity[]> {
    return this.goalRepo.findByUserId(userId);
  }

  async getGoalById(id: string, userId: string): Promise<IGoalEntity | null> {
    const goal = await this.goalRepo.findById(id);
    if (!goal) return null;
    if (goal.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You do not have permission to view this goal.");
    }
    return goal;
  }

  async createGoal(
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
  ): Promise<IGoalEntity> {
    const goal = await this.goalRepo.create({
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      frequency: data.frequency,
      targetValue: data.targetValue,
      currentValue: 0,
      unit: data.unit,
      deadline: data.deadline,
      isCompleted: false,
      progressPercentage: 0,
    });

    Logger.info(`New goal created: ${goal.title} for user ${userId} (${goal.id})`);
    return goal;
  }

  async updateGoal(id: string, userId: string, data: Partial<IGoalEntity>): Promise<IGoalEntity | null> {
    const existing = await this.getGoalById(id, userId);
    if (!existing) {
      throw new NotFoundError("Goal not found.");
    }

    let progressPercentage = existing.progressPercentage;
    if (data.currentValue !== undefined || data.targetValue !== undefined) {
      const cur = data.currentValue !== undefined ? data.currentValue : existing.currentValue;
      const target = data.targetValue !== undefined ? data.targetValue : existing.targetValue;
      progressPercentage = Math.min(100, Math.round((cur / target) * 100));
    }

    const updated = await this.goalRepo.update(id, {
      ...data,
      progressPercentage,
    });

    return updated;
  }

  async toggleGoal(id: string, userId: string): Promise<IGoalEntity | null> {
    const existing = await this.getGoalById(id, userId);
    if (!existing) {
      throw new NotFoundError("Goal not found.");
    }

    const toggled = await this.goalRepo.toggleStatus(id, userId);
    Logger.info(`Goal ${id} toggled for user ${userId}. Completed: ${toggled?.isCompleted}`);
    return toggled;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const existing = await this.getGoalById(id, userId);
    if (!existing) {
      throw new NotFoundError("Goal not found.");
    }

    const deleted = await this.goalRepo.delete(id);
    Logger.info(`Goal ${id} deleted by user ${userId}`);
    return deleted;
  }
}
