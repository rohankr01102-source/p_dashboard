import { Response, NextFunction } from "express";
import { PracticeSchedule } from "../models/PracticeSchedule";
import { isConnectedToMongo } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export const getSchedules = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    if (!isConnectedToMongo) {
      ApiResponse.success(res, {
        schedules: [
          {
            _id: "65a000000000000000000099",
            title: "Daily Vocal Workout",
            frequency: "DAILY",
            preferredTime: "09:00",
            durationMinutes: 30,
            isActive: true,
            focusArea: "WARM_UP",
          },
        ],
        weeklyOverview: {
          activeSchedulesCount: 1,
          weeklyPlannedMinutes: 210,
          daysWithSchedules: [0, 1, 2, 3, 4, 5, 6],
        },
      });
      return;
    }

    const schedules = await PracticeSchedule.find({ userId }).sort({ preferredTime: 1 }).lean();
    const weeklyOverview = await PracticeSchedule.getUserScheduleWeeklyOverview(userId);

    ApiResponse.success(res, { schedules, weeklyOverview });
  }
);

export const createSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const {
      title,
      frequency,
      daysOfWeek,
      preferredTime,
      durationMinutes,
      reminderEnabled,
      reminderMinutesBefore,
      targetVocalDrills,
      focusArea,
    } = req.body;

    if (!preferredTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(preferredTime)) {
      ApiResponse.error(
        res,
        "Preferred time must be in HH:mm 24-hour format (e.g. '09:00').",
        400,
        "VALIDATION_ERROR"
      );
      return;
    }

    if (isConnectedToMongo) {
      const schedule = await PracticeSchedule.create({
        userId,
        title: title || "Daily Vocal Routine",
        frequency: frequency || "DAILY",
        daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
        preferredTime,
        durationMinutes: Math.min(300, Math.max(5, Number(durationMinutes) || 30)),
        reminderEnabled: reminderEnabled !== undefined ? Boolean(reminderEnabled) : true,
        reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
        targetVocalDrills: Array.isArray(targetVocalDrills)
          ? targetVocalDrills
          : ["Lip Trills", "Sirens"],
        focusArea: focusArea || "WARM_UP",
        isActive: true,
      });

      ApiResponse.created(res, schedule, "Practice schedule created successfully.");
      return;
    }

    Logger.warn("[createSchedule] MongoDB not connected — returning demo schedule.");
    ApiResponse.created(
      res,
      { _id: "sched_demo", title, preferredTime, durationMinutes: 30 },
      "Practice schedule created."
    );
  }
);

export const updateSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const { id } = req.params;

    if (isConnectedToMongo) {
      const schedule = await PracticeSchedule.findById(id);
      if (!schedule) {
        ApiResponse.error(res, "Practice schedule not found.", 404, "NOT_FOUND");
        return;
      }

      if (schedule.userId.toString() !== userId) {
        ApiResponse.error(
          res,
          "You do not have permission to modify this schedule.",
          403,
          "FORBIDDEN"
        );
        return;
      }

      const updated = await PracticeSchedule.findByIdAndUpdate(id, req.body, { new: true });
      ApiResponse.success(res, updated, "Schedule updated successfully.");
      return;
    }

    ApiResponse.success(res, null, "Schedule updated.");
  }
);

export const deleteSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const { id } = req.params;

    if (isConnectedToMongo) {
      const schedule = await PracticeSchedule.findById(id);
      if (!schedule) {
        ApiResponse.error(res, "Practice schedule not found.", 404, "NOT_FOUND");
        return;
      }

      if (schedule.userId.toString() !== userId) {
        ApiResponse.error(
          res,
          "You do not have permission to delete this schedule.",
          403,
          "FORBIDDEN"
        );
        return;
      }

      await PracticeSchedule.findByIdAndDelete(id);
    }

    ApiResponse.success(res, null, "Practice schedule deleted successfully.");
  }
);
