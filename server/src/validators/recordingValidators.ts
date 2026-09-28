import { ValidationError } from "../utils/appError";
import { CommonValidators } from "./commonValidators";

export class RecordingValidators {
  static validateUploadMetadata(body: any): { title: string; tags: string[] } {
    const title = typeof body.title === "string" && body.title.trim().length > 0 
      ? body.title.trim() 
      : body.songTitle && typeof body.songTitle === "string" 
      ? body.songTitle.trim() 
      : "Vocal Take";

    if (title.length > 150) {
      throw new ValidationError("Title cannot exceed 150 characters.");
    }

    let tags: string[] = ["Practice"];
    if (body.tags) {
      if (Array.isArray(body.tags)) {
        tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof body.tags === "string") {
        try {
          const parsed = JSON.parse(body.tags);
          if (Array.isArray(parsed)) {
            tags = parsed.map((t: any) => String(t).trim()).filter(Boolean);
          } else {
            tags = [body.tags.trim()];
          }
        } catch {
          tags = body.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
        }
      }
    }

    return { title, tags };
  }

  static validateId(id: string): void {
    CommonValidators.validateObjectId(id, "recordingId");
  }
}
