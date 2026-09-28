import { VocalRangeData, VibratoMetricsData, PitchPoint, AiCoachingFeedbackData } from "../types/analysis.types";

export interface IAnalysisEntity {
  id: string;
  recordingId: string;
  userId: string;
  pitchAccuracy: number;
  tempoConsistency: number;
  vocalRange: VocalRangeData;
  loudnessScore: number;
  breathingScore: number;
  confidenceScore: number;
  overallPerformanceScore: number;
  vibrato: VibratoMetricsData;
  pitchDeviationCentsAvg: number;
  spectralCentroidHz: number;
  resonanceProfile: string;
  pitchCurve: PitchPoint[];
  aiFeedback: AiCoachingFeedbackData;
  performanceGrade?: string;
  createdAt: Date;
  updatedAt: Date;
}
