import { Request, Response } from "express";
import { IGoalService } from "../interfaces/IService.interface";
import { GoalValidators } from "../validators/goalValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, UnauthorizedError } from "../utils/appError";

export class GoalController {
  constructor(private readonly goalService: IGoalService) {}

  private getAuthUserId(req: Request): string {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  getUserGoals = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const goals = await this.goalService.getUserGoals(userId);
    return ApiResponse.success(res, goals, "Goals retrieved successfully.");
  });

  getGoalById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    GoalValidators.validateId(id);

    const userId = this.getAuthUserId(req);
    const goal = await this.goalService.getGoalById(id, userId);

    if (!goal) {
      throw new NotFoundError("Goal not found.");
    }

    return ApiResponse.success(res, goal, "Goal retrieved successfully.");
  });

  createGoal = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const validatedData = GoalValidators.validateCreateGoal(req.body);

    const goal = await this.goalService.createGoal(userId, validatedData);
    return ApiResponse.created(res, goal, "Goal created successfully.");
  });

  updateGoal = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    GoalValidators.validateId(id);

    const userId = this.getAuthUserId(req);
    const updated = await this.goalService.updateGoal(id, userId, req.body);

    if (!updated) {
      throw new NotFoundError("Goal not found.");
    }

    return ApiResponse.success(res, updated, "Goal updated successfully.");
  });

  toggleGoal = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    GoalValidators.validateId(id);

    const userId = this.getAuthUserId(req);
    const toggled = await this.goalService.toggleGoal(id, userId);

    if (!toggled) {
      throw new NotFoundError("Goal not found.");
    }

    return ApiResponse.success(res, toggled, `Goal marked as ${toggled.isCompleted ? "completed" : "in progress"}.`);
  });

  deleteGoal = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    GoalValidators.validateId(id);

    const userId = this.getAuthUserId(req);
    await this.goalService.deleteGoal(id, userId);

    return ApiResponse.success(res, { id, deleted: true }, "Goal deleted successfully.");
  });
}
