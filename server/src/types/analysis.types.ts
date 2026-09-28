export interface PitchPoint {
  time: number;
  frequency: number | null;
  midi: number | null;
  note: string | null;
  isVoiced: boolean;
}

export interface VocalRangeData {
  lowestNote: string;
  highestNote: string;
  lowestMidi?: number;
  highestMidi?: number;
  rangeSemitones: number;
  rangeOctaves: number;
  classifiedVoiceType: string;
}

export interface VibratoMetricsData {
  detected: boolean;
  rateHz: number;
  depthCents: number;
  regularityPct: number;
}

export interface DrillRecommendation {
  title: string;
  focus: string;
  instructions: string;
  durationMinutes?: number;
}

export interface AiCoachingFeedbackData {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendedDrills: DrillRecommendation[];
}

export interface AnalysisCreateDTO {
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
}
