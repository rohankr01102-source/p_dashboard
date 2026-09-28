import { ValidationError } from "../utils/appError";
import { CommonValidators } from "./commonValidators";

export class AnalysisValidators {
  static validateRecordingId(recordingId: string): void {
    CommonValidators.validateObjectId(recordingId, "recordingId");
  }

  static validateTimelineQuery(query: any): { days: number } {
    let days = parseInt(query.days as string, 10);
    if (isNaN(days) || days < 1) days = 30;
    if (days > 365) days = 365;
    return { days };
  }
}
