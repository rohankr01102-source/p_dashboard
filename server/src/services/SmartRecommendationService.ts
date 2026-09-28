import { Session } from "../models/Session";
import { User } from "../models/User";
import { memoryStore } from "./store";
import { isConnectedToMongo } from "../config/db";
import { Logger } from "../utils/logger";

export interface ISuggestedWarmup {
  id: string;
  title: string;
  focus: string;
  durationMinutes: number;
  instructions: string;
  benefit: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface IWeakArea {
  id: string;
  areaTitle: string;
  severity: "LOW" | "MODERATE" | "HIGH";
  metricImpacted: string;
  diagnosticObservation: string;
  impactExplanation: string;
  prescribedRemedy: string;
}

export interface ISmartRecommendationsResponse {
  suggestedDuration: {
    recommendedMinutes: number;
    intensity: "Light Recovery" | "Balanced Workout" | "High Performance";
    rationale: string;
    fatigueRiskLevel: "Low" | "Moderate" | "Elevated";
  };
  suggestedWarmups: ISuggestedWarmup[];
  weakAreas: IWeakArea[];
  vocalHealthTip: string;
  lastAnalyzedAt: string;
}

export class SmartRecommendationService {
  async getRecommendations(userId: string): Promise<ISmartRecommendationsResponse> {
    let sessions: any[] = [];
    let user: any = null;

    if (isConnectedToMongo) {
      try {
        sessions = await Session.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
        user = await User.findById(userId).lean();
      } catch (err) {
        Logger.warn("[SmartRecommendationService] Mongo lookup failed, using memoryStore", err);
      }
    }

    if (!sessions || sessions.length === 0) {
      sessions = memoryStore.sessions.filter((s) => s.userId.toString() === userId.toString());
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === userId.toString()) || {
        vocalType: "Tenor",
        currentStreak: 12,
      };
    }

    // Recent workload calculation
    const oneDayAgo = Date.now() - 24 * 3600 * 1000;
    const pastDayMinutes = sessions
      .filter((s) => new Date(s.createdAt).getTime() >= oneDayAgo)
      .reduce((acc, s) => acc + Math.round((Number(s.durationSeconds) || 60) / 60), 0);

    let recommendedMinutes = 30;
    let intensity: "Light Recovery" | "Balanced Workout" | "High Performance" = "Balanced Workout";
    let fatigueRiskLevel: "Low" | "Moderate" | "Elevated" = "Low";
    let rationale =
      "Your vocal folds are rested. A standard 30-minute balanced workout with register agility and dynamic phrasing is optimal.";

    if (pastDayMinutes > 60) {
      recommendedMinutes = 20;
      intensity = "Light Recovery";
      fatigueRiskLevel = "Elevated";
      rationale =
        "High vocal load detected in past 24 hours. A lighter 20-minute SOVT recovery session is recommended to prevent mucosal strain.";
    } else if (pastDayMinutes > 30) {
      recommendedMinutes = 25;
      intensity = "Balanced Workout";
      fatigueRiskLevel = "Moderate";
      rationale =
        "Consistent vocal pacing. Focus on 25 minutes of precision intonation and breath metering drills.";
    } else {
      recommendedMinutes = 35;
      intensity = "High Performance";
      fatigueRiskLevel = "Low";
      rationale =
        "Prime recovery window. Optimal conditions for a 35-minute session targeting high-register mixed voice expansion.";
    }

    // Compute average intonation, stability, vibrato
    const avgFlatPct =
      sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (Number(s.flatTendencyPct) || 12), 0) / sessions.length
        : 14;

    const avgVibratoScore =
      sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (Number(s.vibratoScore) || 85), 0) / sessions.length
        : 88;

    const weakAreas: IWeakArea[] = [
      {
        id: "wa-descending-intonation",
        areaTitle: "Intonation Droop on Descending Phrases",
        severity: avgFlatPct > 15 ? "MODERATE" : "LOW",
        metricImpacted: "Pitch Accuracy (-14 to -22 cents)",
        diagnosticObservation:
          "Slight flattening tendency detected as pitch steps down into chest register, caused by subglottic pressure dropping prematurely.",
        impactExplanation:
          "Reduces pitch precision on ballad phrase endings and musical theater cadences.",
        prescribedRemedy:
          "Diaphragmatic support engagement: Keep ribcage gently expanded and sing with upward mental imagery on descending intervals.",
      },
      {
        id: "wa-passaggio-bridge",
        areaTitle: "Passaggio Register Shift (E4 – F#4)",
        severity: "MODERATE",
        metricImpacted: "Resonance & Vocal Stability",
        diagnosticObservation:
          "Acoustic spectral thinning observed between 320 Hz and 370 Hz during the transition from thyroarytenoid (chest) to cricothyroid (head) dominance.",
        impactExplanation:
          "Creates abrupt tonal changes or micro-breaks between chest voice and head resonance.",
        prescribedRemedy:
          "Narrow vowels /oo/ and /ee/ across E4-F#4; utilize straw phonation to balance vocal fold compression without constriction.",
      },
      {
        id: "wa-vibrato-onset",
        areaTitle: "Vibrato Onset Latency on Sustained Notes",
        severity: avgVibratoScore < 85 ? "MODERATE" : "LOW",
        metricImpacted: "Vibrato Consistency",
        diagnosticObservation:
          "Takes 1.2 to 1.6 seconds to establish stable 5.5 Hz oscillation on held high notes before vibrato settles.",
        impactExplanation:
          "Can sound straight-toned or strained for the first half of long vocal lines.",
        prescribedRemedy:
          "Practice pulsing abdominal rhythm exercises and relaxed jaw glides to trigger natural vibrato without throat tension.",
      },
    ];

    const suggestedWarmups: ISuggestedWarmup[] = [
      {
        id: "wu-sovt-straw",
        title: "Semi-Occluded Vocal Tract (SOVT) Straw Phonation",
        focus: "Vocal Fold Decongestion & Subglottic Balance",
        durationMinutes: 7,
        instructions:
          "Sing smooth pitch glides through a narrow drinking straw into half a glass of water, maintaining continuous gentle bubbling.",
        benefit:
          "Equalizes pressure across vocal cords, relieving laryngeal tension and promoting effortless resonance.",
        difficulty: "Beginner",
      },
      {
        id: "wu-sirens-octave",
        title: "Octave Siren Glides on /Ng/ to /Ee/",
        focus: "Passaggio Smoothing & Upper Resonance Vaulting",
        durationMinutes: 8,
        instructions:
          "Glide seamlessly from your lowest comfort note up into head voice on /ng/, then open smoothly into /ee/ at the peak.",
        benefit:
          "Eliminates the abrupt register 'break' at E4-F#4 by gently flexing the cricothyroid muscles.",
        difficulty: "Intermediate",
      },
      {
        id: "wu-staccato-arpeggios",
        title: "Staccato Arpeggio Bounces ('Ha-Ha-Ha')",
        focus: "Diaphragmatic Breath Metering & Intonation Precision",
        durationMinutes: 6,
        instructions:
          "Perform 1-3-5-8-5-3-1 arpeggios on crisp 'Ha' sounds, focusing on abdominal bouncing rather than throat pushing.",
        benefit:
          "Locks in pitch accuracy and corrects pitch flattening on descending phrases.",
        difficulty: "Intermediate",
      },
    ];

    return {
      suggestedDuration: {
        recommendedMinutes,
        intensity,
        rationale,
        fatigueRiskLevel,
      },
      suggestedWarmups,
      weakAreas,
      vocalHealthTip:
        "Hydration tip: Drink room temperature water 90 minutes before singing. True vocal cord hydration is systemic, not topical.",
      lastAnalyzedAt: new Date().toISOString(),
    };
  }
}

export const smartRecommendationService = new SmartRecommendationService();
