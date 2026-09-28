import { Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { ENV } from "../config/env";
import { memoryStore } from "../services/store";
import {
  Session,
  User,
  Goal,
  Achievement,
  Recording,
  Analysis,
  PracticeSession,
} from "../models";
import { isConnectedToMongo } from "../config/db";
import { analyzeAudioWithAI, generateIntelligentVocalAnalysis } from "../services/aiService";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadAndAnalyze = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const file = req.file;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      ApiResponse.error(res, "User session required to upload recording.", 401, "UNAUTHORIZED");
      return;
    }

    const title = (
      req.body.title || (file ? file.originalname.replace(/\.[^/.]+$/, "") : "Vocal Practice Take")
    ).slice(0, 100);
    const songTitle = (req.body.songTitle || "Freestyle Practice").slice(0, 100);
    const userNotes = (req.body.notes || "").slice(0, 1000);

    let tags = ["Practice", "Vocalytics AI"];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags.map((t: unknown) => String(t).slice(0, 30));
      } else {
        try {
          const parsed = JSON.parse(req.body.tags);
          if (Array.isArray(parsed)) tags = parsed.map((t: unknown) => String(t).slice(0, 30));
        } catch {
          tags = [String(req.body.tags).slice(0, 30)];
        }
      }
    }

    // Call AI audio service with fault-tolerant fallback
    let aiResult;
    try {
      aiResult = await analyzeAudioWithAI(
        file ? file.path : "",
        file ? file.originalname : "live-mic-recording.wav"
      );
    } catch (aiErr: unknown) {
      Logger.warn("[Session Upload] AI audio analysis encountered error; falling back to heuristic DSP", aiErr);
      aiResult = generateIntelligentVocalAnalysis(file ? file.originalname : "live-mic-recording.wav");
    }

    const durationSeconds = aiResult.duration || 60;
    const sessionMins = Math.max(1, Math.round(durationSeconds / 60));
    const sessionHours = Number((sessionMins / 60).toFixed(2));
    const audioUrl = file ? `/uploads/${file.filename}` : "/audio/sample-1.wav";
    const audioFileName = file ? file.originalname : "live-recording.wav";
    const fileSizeBytes = file ? file.size : 2048000;

    // Use a real ObjectId — eliminates fake ID security risk
    const sessionObjectId = new mongoose.Types.ObjectId();

    const newSession = {
      _id: sessionObjectId.toString(),
      userId,
      title,
      songTitle,
      audioUrl,
      audioFileName,
      fileSizeBytes,
      durationSeconds,
      overallScore: aiResult.overall_score ?? (aiResult as any).overallScore ?? 85.0,
      grade: aiResult.grade || "B+",
      pitchAccuracyScore:
        aiResult.pitch_analysis?.accuracy_score ?? (aiResult as any).pitchAccuracy ?? 85.0,
      pitchStabilityScore:
        aiResult.pitch_analysis?.stability_score ?? (aiResult as any).noteStability ?? 85.0,
      centsDeviationAvg: aiResult.pitch_analysis?.cents_deviation_avg ?? 14.0,
      sharpTendencyPct: aiResult.pitch_analysis?.sharp_tendency_pct ?? 10.0,
      flatTendencyPct: aiResult.pitch_analysis?.flat_tendency_pct ?? 15.0,
      inTunePercentage: aiResult.pitch_analysis?.in_tune_percentage ?? 85.0,
      vibratoRateHz: aiResult.vibrato?.rate_hz ?? 5.6,
      vibratoDepthCents: aiResult.vibrato?.depth_cents ?? 80.0,
      vibratoScore: aiResult.vibrato?.score ?? 85.0,
      dynamicRangeDb: aiResult.dynamics?.dynamic_range_db ?? 24.0,
      peakDb: aiResult.dynamics?.peak_db ?? -3.5,
      breathPausesCount:
        aiResult.dynamics?.breath_pauses_detected ??
        (aiResult as any).breathDetection?.breathCount ??
        8,
      lowestNote:
        aiResult.vocal_range?.lowest_note ||
        (aiResult as any).vocalRange?.split("-")[0] ||
        "C3",
      highestNote:
        aiResult.vocal_range?.highest_note ||
        (aiResult as any).vocalRange?.split("-")[1] ||
        "G4",
      rangeSemitones: aiResult.vocal_range?.range_semitones ?? 19,
      voiceTypeDetected: aiResult.vocal_range?.classified_voice_type || "Tenor",
      timbreClarityScore: aiResult.timbre?.clarity_score ?? 85.0,
      spectralCentroidHz: aiResult.timbre?.spectral_centroid_hz ?? 1850,
      resonanceProfile: aiResult.timbre?.resonance_profile || "Optimal Forward Placement",
      pitchCurve: aiResult.pitch_curve || [],
      coachingFeedback:
        aiResult.coaching_feedback ||
        (Array.isArray((aiResult as any).feedback)
          ? {
              summary: (aiResult as any).feedback[0] || "Solid vocal practice session with clean pitch centering.",
              strengths: (aiResult as any).feedback.slice(0, 2),
              areas_for_improvement: (aiResult as any).feedback.slice(2),
              recommended_drills: [],
            }
          : {
              summary: "Solid vocal practice session with clean pitch centering.",
              strengths: ["Clean interval precision", "Natural vibrato"],
              areas_for_improvement: ["Keep consistent abdominal breath support through phrase tails"],
              recommended_drills: [],
            }),
      userNotes,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update in-memory store
    memoryStore.sessions.unshift(newSession);

    const user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
    if (user) {
      user.totalPracticeHours = (user.totalPracticeHours || 0) + sessionHours;
      user.totalPracticeMinutes = (user.totalPracticeMinutes || 0) + sessionMins;
      user.totalSessionsCount = (user.totalSessionsCount || 0) + 1;
      const allUserSessions = memoryStore.sessions.filter(
        (s) => s.userId.toString() === userId.toString()
      );
      const avg =
        allUserSessions.reduce((acc, s) => acc + s.overallScore, 0) / allUserSessions.length;
      user.averageScore = Math.round(avg * 10) / 10;
      user.lastPracticeDate = new Date();
      user.lastActiveDate = new Date();
    }

    // Update goals progress
    memoryStore.goals.forEach((g) => {
      if (g.userId.toString() === userId.toString()) {
        if (g.category === "PRACTICE_TIME" && !g.isCompleted) {
          g.currentPracticeHours = (g.currentPracticeHours || 0) + sessionHours;
          g.currentValue += sessionMins;
          if (g.currentValue >= g.targetValue) {
            g.isCompleted = true;
            g.completedAt = new Date();
          }
        } else if (
          g.category === "PITCH_ACCURACY" &&
          newSession.pitchAccuracyScore >= 90 &&
          !g.isCompleted
        ) {
          g.currentSessions = (g.currentSessions || 0) + 1;
          g.currentValue += 1;
          if (g.currentValue >= g.targetValue) {
            g.isCompleted = true;
            g.completedAt = new Date();
          }
        }
      }
    });

    // Check achievement unlock
    if (newSession.pitchAccuracyScore >= 90) {
      const ach = memoryStore.achievements.find(
        (a) => a.userId.toString() === userId.toString() && a.badgeKey === "pitch-perfect-90"
      );
      if (ach) {
        ach.isUnlocked = true;
        ach.progress = 100;
        ach.unlockedAt = new Date();
      }
    }

    // Persist to MongoDB schemas if connected
    if (isConnectedToMongo) {
      try {
        const isValidId = mongoose.Types.ObjectId.isValid(userId.toString());
        if (!isValidId) {
          Logger.warn(`[Session Upload] Invalid userId format for MongoDB persistence: ${userId}. Skipping DB write.`);
        } else {
          const userObjId = new mongoose.Types.ObjectId(userId.toString());

        // 1. Persist legacy Session model
          await Session.create({ ...newSession, _id: sessionObjectId });

          // 2. Persist new Recording model
          const createdRecording = await Recording.create({
            userId: userObjId,
            title,
            audioUrl,
            duration: Math.round(durationSeconds),
            uploadDate: new Date(),
            fileSize: fileSizeBytes,
            format: file ? file.mimetype.split("/")[1] || "wav" : "wav",
            sampleRate: 22050,
            channels: 1,
            tags,
            isArchived: false,
          });

          // 3. Persist new Analysis model
          await Analysis.create({
            recordingId: createdRecording._id,
            userId: userObjId,
            pitchAccuracy: aiResult.pitch_analysis?.accuracy_score || 85.0,
            tempoConsistency: 88.0,
            vocalRange: {
              lowestNote: aiResult.vocal_range?.lowest_note || "C3",
              highestNote: aiResult.vocal_range?.highest_note || "G4",
              semitones: aiResult.vocal_range?.range_semitones || 19,
              octaves: aiResult.vocal_range?.octaves || 1.6,
              voiceType: aiResult.vocal_range?.classified_voice_type || "Tenor",
            },
            loudnessScore: aiResult.dynamics?.score || 86.0,
            breathingScore: 84.0,
            confidenceScore: 85.0,
            overallPerformanceScore: aiResult.overall_score || 85.0,
            vibrato: {
              detected: aiResult.vibrato?.detected ?? true,
              rateHz: aiResult.vibrato?.rate_hz || 5.6,
              depthCents: aiResult.vibrato?.depth_cents || 80.0,
              regularity: aiResult.vibrato?.regularity_pct || 88.0,
            },
            pitchCurve: aiResult.pitch_curve || [],
            aiFeedback: {
              summary: newSession.coachingFeedback.summary,
              strengths: newSession.coachingFeedback.strengths,
              areasForImprovement: newSession.coachingFeedback.areas_for_improvement,
              drills: newSession.coachingFeedback.recommended_drills,
            },
          });

          // 4. Persist PracticeSession model
          await PracticeSession.create({
            userId: userObjId,
            recordingId: createdRecording._id,
            title,
            sessionType: "SONG_REHEARSAL",
            startTime: new Date(Date.now() - durationSeconds * 1000),
            endTime: new Date(),
            durationMinutes: sessionMins,
            perceivedDifficulty: 3,
            vocalFatigueLevel: 2,
            mood: "CONFIDENT",
            notes: userNotes,
            status: "COMPLETED",
            tags,
            audioUrl,
            overallScore: aiResult.overall_score || 85.0,
          });

          // 5. Update User model statistics
          await User.findByIdAndUpdate(userId, {
            $inc: { totalPracticeHours: sessionHours },
            $set: { lastActiveDate: new Date() },
          });

          // 6. Advance goals in MongoDB
          await Goal.updateMany(
            { userId: userObjId, isCompleted: false },
            {
              $inc: {
                currentPracticeHours: sessionHours,
                currentValue: sessionMins,
              },
            }
          );
        } // end isValidId else block
      } catch (dbErr: unknown) {
        Logger.warn("[MongoDB] Multi-schema persistence warning:", dbErr);
      }
    }

    ApiResponse.created(res, newSession, "Vocal recording analyzed successfully by Vocalytics AI.");
  }
);

export const getAllSessions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required to fetch sessions.", 401, "UNAUTHORIZED");
      return;
    }

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);

    let sessions: unknown[] = [];

    if (isConnectedToMongo) {
      try {
        sessions = await Session.find({ userId })
          .select("-pitchCurve")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
      } catch (e) {
        Logger.warn("[getAllSessions] MongoDB query failed, falling back to memoryStore", e);
      }
    }

    if (!sessions || sessions.length === 0) {
      sessions = memoryStore.sessions
        .filter((s) => s.userId.toString() === userId.toString())
        .map((s) => {
          const summary = { ...s };
          delete (summary as Record<string, unknown>).pitchCurve;
          return summary;
        })
        .slice((page - 1) * limit, page * limit);
    }

    let totalCount = 0;
    if (isConnectedToMongo) {
      try {
        totalCount = await Session.countDocuments({ userId });
      } catch (e) {
        totalCount = memoryStore.sessions.filter((s) => s.userId.toString() === userId.toString()).length;
      }
    } else {
      totalCount = memoryStore.sessions.filter((s) => s.userId.toString() === userId.toString()).length;
    }

    const totalPages = Math.ceil(totalCount / limit) || 1;
    ApiResponse.paginated(res, {
      data: sessions as unknown[],
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
);

export const getSessionById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    let session: Record<string, unknown> | null = null;
    if (isConnectedToMongo) {
      try {
        session = (await Session.findById(id).lean()) as Record<string, unknown> | null;
      } catch (e) {
        Logger.warn("[getSessionById] MongoDB findById failed", e);
      }
    }

    if (!session) {
      session =
        (memoryStore.sessions.find((s) => s._id.toString() === id) as Record<
          string,
          unknown
        > | null) ?? null;
    }

    if (!session) {
      ApiResponse.error(res, "Practice session not found.", 404, "SESSION_NOT_FOUND");
      return;
    }

    // Strict ownership verification (BOLA / IDOR defense)
    if (session.userId && session.userId.toString() !== userId) {
      ApiResponse.error(res, "You do not have permission to view this session.", 403, "FORBIDDEN");
      return;
    }

    ApiResponse.success(res, session);
  }
);

export const deleteSession = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    let targetSession: Record<string, unknown> | null = null;

    if (isConnectedToMongo) {
      try {
        targetSession = (await Session.findById(id)) as unknown as Record<string, unknown> | null;
      } catch (e) {
        Logger.warn("[deleteSession] MongoDB findById failed", e);
      }
    }

    if (!targetSession) {
      targetSession =
        (memoryStore.sessions.find((s) => s._id.toString() === id) as Record<
          string,
          unknown
        > | null) ?? null;
    }

    if (!targetSession) {
      ApiResponse.error(res, "Session not found.", 404, "SESSION_NOT_FOUND");
      return;
    }

    // Strict ownership authorization
    if (targetSession.userId && targetSession.userId.toString() !== userId) {
      ApiResponse.error(
        res,
        "You do not have permission to delete this session.",
        403,
        "FORBIDDEN"
      );
      return;
    }

    // Remove associated audio file asynchronously if stored locally (path traversal guarded)
    const audioUrl = targetSession.audioUrl as string | undefined;
    if (audioUrl && audioUrl.startsWith("/uploads/")) {
      const safeFileName = path.basename(audioUrl.replace("/uploads/", ""));
      const uploadsDir = path.resolve(ENV.UPLOAD_DIR);
      const fullPath = path.resolve(uploadsDir, safeFileName);
      const relative = path.relative(uploadsDir, fullPath);
      if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
        fs.promises.unlink(fullPath).catch(() => {});
      }
    }

    memoryStore.sessions = memoryStore.sessions.filter((s) => s._id.toString() !== id);

    if (isConnectedToMongo) {
      try {
        await Session.findByIdAndDelete(id);
        await PracticeSession.findOneAndDelete({ audioUrl: targetSession.audioUrl });
      } catch (e) {
        Logger.warn("[deleteSession] MongoDB delete failed", e);
      }
    }

    ApiResponse.success(res, null, "Session deleted successfully.");
  }
);

export const updateNotes = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const notes = String(req.body.notes || "").slice(0, 1000);
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    let session: Record<string, unknown> | null = null;
    if (isConnectedToMongo) {
      try {
        session = (await Session.findById(id)) as unknown as Record<string, unknown> | null;
      } catch (e) {
        Logger.warn("[updateNotes] MongoDB findById failed", e);
      }
    }

    if (!session) {
      session =
        (memoryStore.sessions.find((s) => s._id.toString() === id) as Record<
          string,
          unknown
        > | null) ?? null;
    }

    if (!session) {
      ApiResponse.error(res, "Session not found.", 404, "NOT_FOUND");
      return;
    }

    // Strict ownership verification
    if (session.userId && session.userId.toString() !== userId) {
      ApiResponse.error(
        res,
        "You do not have permission to modify this session.",
        403,
        "FORBIDDEN"
      );
      return;
    }

    session.userNotes = notes;
    session.updatedAt = new Date();

    if (isConnectedToMongo) {
      try {
        await Session.findByIdAndUpdate(id, { userNotes: notes, updatedAt: new Date() });
      } catch (e) {
        Logger.warn("[updateNotes] MongoDB update failed", e);
      }
    }

    ApiResponse.success(res, session);
  }
);
