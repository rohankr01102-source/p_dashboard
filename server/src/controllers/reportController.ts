import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { memoryStore } from "../services/store";
import { Report } from "../models/Report";
import { isConnectedToMongo } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

const VALID_PERIODS = new Set(["WEEKLY", "MONTHLY", "COMPREHENSIVE"]);

export const getReports = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required to fetch reports.", 401, "UNAUTHORIZED");
      return;
    }

    let reports: unknown[] = [];

    if (isConnectedToMongo) {
      try {
        reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        Logger.warn("[getReports] MongoDB query failed, falling back to memoryStore", e);
      }
    }

    if (!reports || reports.length === 0) {
      reports = memoryStore.reports.filter((r) => r.userId.toString() === userId.toString());
    }

    ApiResponse.success(res, reports);
  }
);

export const generateReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required to generate reports.", 401, "UNAUTHORIZED");
      return;
    }

    const rawPeriod = req.body.period;
    const reportPeriod = VALID_PERIODS.has(rawPeriod) ? rawPeriod : "WEEKLY";

    const userSessions = memoryStore.sessions.filter(
      (s) => s.userId.toString() === userId.toString()
    );
    const totalSessions = userSessions.length;
    const totalMinutes = userSessions.reduce(
      (acc, s) => acc + Math.round((Number(s.durationSeconds) || 60) / 60),
      0
    );
    const avgScore =
      totalSessions > 0
        ? Math.round(
            (userSessions.reduce((acc, s) => acc + (Number(s.overallScore) || 85), 0) /
              totalSessions) *
              10
          ) / 10
        : 88.0;

    const avgPitchAccuracy =
      totalSessions > 0
        ? Math.round(
            (userSessions.reduce((acc, s) => acc + (Number(s.pitchAccuracyScore) || 85), 0) /
              totalSessions) *
              10
          ) / 10
        : 89.0;

    const avgStability =
      totalSessions > 0
        ? Math.round(
            (userSessions.reduce((acc, s) => acc + (Number(s.pitchStabilityScore) || 85), 0) /
              totalSessions) *
              10
          ) / 10
        : 87.0;

    const avgVibrato =
      totalSessions > 0
        ? Math.round(
            (userSessions.reduce((acc, s) => acc + (Number(s.vibratoScore) || 80), 0) /
              totalSessions) *
              10
          ) / 10
        : 88.0;

    const daysBack =
      reportPeriod === "MONTHLY" ? 30 : reportPeriod === "COMPREHENSIVE" ? 90 : 7;

    // Use a real ObjectId — eliminates fake ID security risk
    const reportObjectId = new mongoose.Types.ObjectId();

    const newReport = {
      _id: reportObjectId.toString(),
      userId,
      title: `${reportPeriod.charAt(0) + reportPeriod.slice(1).toLowerCase()} Vocal Health & Mastery Report`,
      reportPeriod,
      startDate: new Date(Date.now() - daysBack * 86400000),
      endDate: new Date(),
      summary: {
        totalSessions,
        totalMinutesPracticed: totalMinutes,
        averageScore: avgScore,
        pitchAccuracyAvg: avgPitchAccuracy,
        stabilityAvg: avgStability,
        vibratoConsistencyAvg: avgVibrato,
        rangeCovered: "C3 - A4 (21 Semitones)",
        trendPitch: "UP",
        trendDynamics: "UP",
      },
      keyStrengths: [
        `Maintained an average of ${avgPitchAccuracy}% pitch intonation accuracy across practice takes.`,
        "Upper tessitura demonstrated relaxed resonance up to sustained A4 without audible strain.",
        "Acoustic spectral brightness indicates healthy vocal fold closure and optimal singer's formant.",
      ],
      growthAreas: [
        "Focus on diaphragmatic breath metering during prolonged descending phrases.",
        "Gradually explore extending mixed voice upward to B4 / C5 with vowel narrowing drills.",
      ],
      prescribedWarmups: [
        {
          title: "Straw Phonation & Semi-Occluded Vocal Tract (SOVT)",
          focus: "Vocal Fold Decongestion & Aerodynamic Balance",
          instructions:
            "Vocalize 5 minutes through a narrow drinking straw into water, producing smooth pitch glides.",
        },
        {
          title: "Vowel Vaulting /ee/ to /ah/",
          focus: "Pharyngeal Ring & Singer's Formant",
          instructions:
            "Ascend 5-tone scales alternating vowels while keeping soft palate arched high.",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.reports.unshift(newReport);

    if (isConnectedToMongo) {
      try {
        await Report.create({ ...newReport, _id: reportObjectId });
      } catch (e) {
        Logger.warn("[generateReport] MongoDB create failed", e);
      }
    }

    ApiResponse.created(res, newReport, "Vocal performance report generated successfully.");
  }
);
