import { Response, NextFunction } from "express";
import { Playlist } from "../models/Playlist";
import { isConnectedToMongo } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export const getPlaylists = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    if (!isConnectedToMongo) {
      ApiResponse.success(res, { userPlaylists: [], popularPlaylists: [] });
      return;
    }

    const userPlaylists = await Playlist.getUserPlaylistsWithStats(userId);
    const popularPlaylists = await Playlist.getPopularPlaylists(6);

    ApiResponse.success(res, { userPlaylists, popularPlaylists });
  }
);

export const createPlaylist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const { title, description, coverImage, isPublic, tags } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      ApiResponse.error(res, "Playlist title is required.", 400, "VALIDATION_ERROR");
      return;
    }

    if (isConnectedToMongo) {
      const playlist = await Playlist.create({
        userId,
        title: title.trim().slice(0, 120),
        description: (description || "").slice(0, 500),
        coverImage: coverImage || "",
        isPublic: Boolean(isPublic),
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
        items: [],
      });

      ApiResponse.created(res, playlist, "Playlist created successfully.");
      return;
    }

    Logger.warn("[createPlaylist] MongoDB not connected — returning demo playlist.");
    ApiResponse.created(res, { _id: "playlist_demo", title, items: [] }, "Playlist created.");
  }
);

export const addItemToPlaylist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const { id } = req.params;
    const { recordingId, notes } = req.body;

    if (!recordingId) {
      ApiResponse.error(res, "recordingId is required.", 400, "VALIDATION_ERROR");
      return;
    }

    if (isConnectedToMongo) {
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        ApiResponse.error(res, "Playlist not found.", 404, "NOT_FOUND");
        return;
      }

      if (playlist.userId.toString() !== userId) {
        ApiResponse.error(
          res,
          "You do not have permission to modify this playlist.",
          403,
          "FORBIDDEN"
        );
        return;
      }

      const order = playlist.items.length;
      playlist.items.push({
        recordingId,
        addedAt: new Date(),
        order,
        notes: notes ? String(notes).slice(0, 300) : "",
      });

      await playlist.save();
      ApiResponse.success(res, playlist, "Item added to playlist.");
      return;
    }

    ApiResponse.success(res, null, "Item added to playlist.");
  }
);

export const deletePlaylist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const { id } = req.params;

    if (isConnectedToMongo) {
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        ApiResponse.error(res, "Playlist not found.", 404, "NOT_FOUND");
        return;
      }

      if (playlist.userId.toString() !== userId) {
        ApiResponse.error(
          res,
          "You do not have permission to delete this playlist.",
          403,
          "FORBIDDEN"
        );
        return;
      }

      await Playlist.findByIdAndDelete(id);
    }

    ApiResponse.success(res, null, "Playlist deleted successfully.");
  }
);
