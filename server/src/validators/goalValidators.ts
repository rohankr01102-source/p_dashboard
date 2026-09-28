import { ValidationError } from "../utils/appError";
import { CommonValidators } from "./commonValidators";
import { GoalCategory, GoalFrequency } from "../interfaces/IGoal.interface";

const VALID_CATEGORIES: GoalCategory[] = [
  "PITCH_ACCURACY",
  "PRACTICE_TIME",
  "RANGE_EXPANSION",
  "VIBRATO_STABILITY",
  "DAILY_STREAK",
];

const VALID_FREQUENCIES: GoalFrequency[] = ["DAILY", "WEEKLY", "MONTHLY", "ONE_OFF"];

export class GoalValidators {
  static validateCreateGoal(data: any): {
    title: string;
    description?: string;
    category: GoalCategory;
    frequency: GoalFrequency;
    targetValue: number;
    unit: string;
    deadline?: Date;
  } {
    const errors: Record<string, string> = {};

    if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.title = "Goal title is required.";
    }

    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      errors.category = `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`;
    }

    const targetValue = Number(data.targetValue);
    if (isNaN(targetValue) || targetValue <= 0) {
      errors.targetValue = "Target value must be a positive number.";
    }

    if (!data.unit || typeof data.unit !== "string") {
      errors.unit = "Unit of measurement is required (e.g., %, min, days, notes).";
    }

    const frequency: GoalFrequency = VALID_FREQUENCIES.includes(data.frequency) ? data.frequency : "WEEKLY";

    let deadline: Date | undefined;
    const rawDate = data.targetDate || data.deadline;
    if (rawDate) {
      const parsedDeadline = new Date(rawDate);
      if (isNaN(parsedDeadline.getTime())) {
        errors.deadline = "Invalid deadline / target date format.";
      } else {
        deadline = parsedDeadline;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Goal validation failed", errors);
    }

    return {
      title: data.title.trim(),
      description: data.description ? String(data.description).trim() : undefined,
      category: data.category,
      frequency,
      targetValue,
      unit: data.unit.trim(),
      deadline,
    };
  }

  static validateId(id: string): void {
    CommonValidators.validateObjectId(id, "goalId");
  }
}
