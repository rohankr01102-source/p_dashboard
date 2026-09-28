import { ValidationError } from "../utils/appError";
import { CommonValidators } from "./commonValidators";

const VALID_VOCAL_TYPES = [
  "Soprano",
  "Mezzo-Soprano",
  "Contralto",
  "Countertenor",
  "Tenor",
  "Baritone",
  "Bass",
  "Unclassified",
];

const VALID_EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];

export class UserValidators {
  static validateProfileUpdate(data: any): Record<string, any> {
    const updates: Record<string, any> = {};

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length < 2) {
        throw new ValidationError("Name must be at least 2 characters long.");
      }
      updates.name = data.name.trim();
    }

    if (data.bio !== undefined) {
      updates.bio = String(data.bio).slice(0, 500);
    }

    if (data.avatar !== undefined) {
      updates.avatar = String(data.avatar);
    }

    const vocalType = data.vocalType !== undefined ? data.vocalType : data.voiceType;
    if (vocalType !== undefined) {
      if (!VALID_VOCAL_TYPES.includes(vocalType)) {
        throw new ValidationError(`Invalid vocalType. Allowed: ${VALID_VOCAL_TYPES.join(", ")}`);
      }
      updates.vocalType = vocalType;
    }

    const experienceLevel = data.experienceLevel !== undefined ? data.experienceLevel : data.skillLevel;
    if (experienceLevel !== undefined) {
      if (!VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
        throw new ValidationError(`Invalid experienceLevel. Allowed: ${VALID_EXPERIENCE_LEVELS.join(", ")}`);
      }
      updates.experienceLevel = experienceLevel;
    }

    if (data.preferredGenres !== undefined) {
      if (Array.isArray(data.preferredGenres)) {
        updates.preferredGenres = data.preferredGenres.map((g: any) => String(g).trim()).filter(Boolean);
      }
    }

    if (data.preferences && typeof data.preferences === "object") {
      const p = data.preferences;
      updates.preferences = {
        ...(typeof p.darkTheme === "boolean" ? { darkTheme: p.darkTheme } : {}),
        ...(typeof p.autoAnalyze === "boolean" ? { autoAnalyze: p.autoAnalyze } : {}),
        ...(typeof p.audioInputDevice === "string" ? { audioInputDevice: String(p.audioInputDevice).slice(0, 100) } : {}),
        ...(typeof p.notifications === "boolean" ? { notifications: p.notifications } : {}),
        ...(typeof p.emailDigest === "boolean" ? { emailDigest: p.emailDigest } : {}),
      };
    }

    return updates;
  }

  static validatePreferencesUpdate(data: any): Record<string, any> {
    if (!data || typeof data !== "object") {
      throw new ValidationError("Preferences payload must be an object.");
    }
    const clean: Record<string, any> = {};
    if (typeof data.darkTheme === "boolean") clean.darkTheme = data.darkTheme;
    if (typeof data.autoAnalyze === "boolean") clean.autoAnalyze = data.autoAnalyze;
    if (typeof data.audioInputDevice === "string") clean.audioInputDevice = String(data.audioInputDevice).slice(0, 100);
    if (typeof data.notifications === "boolean") clean.notifications = data.notifications;
    if (typeof data.emailDigest === "boolean") clean.emailDigest = data.emailDigest;
    return clean;
  }

  static validateId(id: string): void {
    CommonValidators.validateObjectId(id, "userId");
  }
}
