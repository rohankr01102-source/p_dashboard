import { isConnectedToMongo } from "../config/db";
import { Logger } from "../utils/logger";
import { User, IUser } from "../models/User";
import { Session, ISession } from "../models/Session";
import { Goal, IGoal } from "../models/Goal";
import { Achievement, IAchievement } from "../models/Achievement";
import { Report, IReport } from "../models/Report";
import { Recording } from "../models/Recording";
import { Analysis } from "../models/Analysis";
import { PracticeSession } from "../models/PracticeSession";
import { Notification } from "../models/Notification";

export const memoryStore = {
  users: [] as any[],
  sessions: [] as any[],
  goals: [] as any[],
  achievements: [] as any[],
  reports: [] as any[],
  notifications: [] as any[],
};


// Generates synthetic pitch curve data for visualization
export function generatePitchCurveData(baseMidi: number = 60, points: number = 80, isPro: boolean = false) {
  const curve = [];
  let currentMidi = baseMidi;
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  for (let i = 0; i < points; i++) {
    const time = Math.round((i * 0.15) * 100) / 100;
    // Intermittent breath pauses
    if (i % 22 === 0 || i % 23 === 0) {
      curve.push({
        time,
        frequency: null,
        midi: null,
        note: null,
        is_voiced: false,
      });
      continue;
    }

    // Step melody
    if (i % 8 === 0) {
      const step = [-2, -1, 0, 1, 2, 3, 4][Math.floor(Math.random() * 7)];
      currentMidi = Math.max(48, Math.min(74, baseMidi + step));
    }

    // Natural micro-vibrato (5.5 Hz oscillation)
    const vibrato = Math.sin(i * 0.8) * (isPro ? 0.45 : 0.25);
    const noise = (Math.random() - 0.5) * (isPro ? 0.08 : 0.25);
    const sungMidi = currentMidi + vibrato + noise;
    const freq = 440 * Math.pow(2, (sungMidi - 69) / 12);
    const roundedMidi = Math.round(sungMidi);
    const noteName = `${notes[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}`;

    curve.push({
      time,
      frequency: Math.round(freq * 10) / 10,
      midi: Math.round(sungMidi * 100) / 100,
      note: noteName,
      is_voiced: true,
    });
  }
  return curve;
}

export const initSeedData = async () => {
  const demoUserId = "65a000000000000000000001";

  const defaultUser = {
    _id: demoUserId,
    name: "Elena Vance",
    email: "elena.vocalist@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    vocalType: "Tenor",
    voiceType: "Tenor",
    experienceLevel: "Advanced",
    skillLevel: "Advanced",
    bio: "Contemporary pop & musical theater vocalist. Focusing on chest-to-head mix blending and vibrato control.",
    preferredGenres: ["Pop", "Musical Theater", "R&B"],
    vocalRangeLowest: "C3",
    vocalRangeHighest: "A4",
    totalPracticeHours: 8.25,
    totalPracticeMinutes: 495,
    totalSessionsCount: 14,
    averageScore: 87.8,
    currentStreak: 12,
    longestStreak: 15,
    streakDays: 12,
    lastPracticeDate: new Date(),
    lastActiveDate: new Date(),
    preferences: {
      darkTheme: true,
      autoAnalyze: true,
      audioInputDevice: "Shure SM7B Vocal Mic",
      notifications: true,
    },
    createdAt: new Date(Date.now() - 30 * 86400000),
    updatedAt: new Date(),
  };

  const sampleSessions = [
    {
      _id: "65a000000000000000000010",
      userId: demoUserId,
      title: "Morning Resonant Pitch Ladders",
      songTitle: "Vocal Sirens & 5-Tone Scales",
      audioUrl: "/audio/sample-1.wav",
      audioFileName: "morning-sirens.wav",
      fileSizeBytes: 2450000,
      durationSeconds: 94,
      overallScore: 84.5,
      grade: "B+",
      pitchAccuracyScore: 83.0,
      pitchStabilityScore: 82.5,
      centsDeviationAvg: 16.2,
      sharpTendencyPct: 14.0,
      flatTendencyPct: 22.0,
      inTunePercentage: 79.5,
      vibratoRateHz: 5.4,
      vibratoDepthCents: 68.0,
      vibratoScore: 86.0,
      dynamicRangeDb: 22.4,
      peakDb: -6.2,
      breathPausesCount: 8,
      lowestNote: "C3",
      highestNote: "F4",
      rangeSemitones: 17,
      voiceTypeDetected: "Tenor",
      timbreClarityScore: 84.0,
      spectralCentroidHz: 1820,
      resonanceProfile: "Optimal Forward Placement",
      pitchCurve: generatePitchCurveData(52, 60, false),
      coachingFeedback: {
        summary: "Solid warm-up session. Good laryngeal relaxation, slight flattening noticed on long descending arpeggios.",
        strengths: [
          "Smooth register transition into middle voice",
          "Balanced vibrato rate at 5.4 Hz",
          "Clean breath intake intervals without audible gasping"
        ],
        areas_for_improvement: [
          "Tendency to drop flat by 22 cents on phrase terminals",
          "Engage abdominal support earlier before ascending intervals"
        ],
        recommended_drills: [
          {
            title: "Staccato Arpeggio Energizers",
            focus: "Intonation Elevation & Support",
            description: "Practice rapid 1-3-5-8-5-3-1 arpeggios on 'Ha-Ha' with diaphragmatic bounce to prevent pitch sag."
          }
        ]
      },
      tags: ["Warm-up", "Sirens", "Technique"],
      createdAt: new Date(Date.now() - 12 * 86400000),
    },
    {
      _id: "65a000000000000000000011",
      userId: demoUserId,
      title: "Adele - Easy On Me (Chorus Practice)",
      songTitle: "Easy On Me",
      audioUrl: "/audio/sample-2.wav",
      audioFileName: "easy-on-me-chorus.wav",
      fileSizeBytes: 3120000,
      durationSeconds: 112,
      overallScore: 87.2,
      grade: "A",
      pitchAccuracyScore: 88.0,
      pitchStabilityScore: 86.0,
      centsDeviationAvg: 12.8,
      sharpTendencyPct: 18.0,
      flatTendencyPct: 11.0,
      inTunePercentage: 86.4,
      vibratoRateHz: 5.7,
      vibratoDepthCents: 82.0,
      vibratoScore: 89.0,
      dynamicRangeDb: 28.1,
      peakDb: -3.4,
      breathPausesCount: 11,
      lowestNote: "D3",
      highestNote: "G4",
      rangeSemitones: 17,
      voiceTypeDetected: "Tenor",
      timbreClarityScore: 88.5,
      spectralCentroidHz: 2150,
      resonanceProfile: "Optimal Forward Placement",
      pitchCurve: generatePitchCurveData(55, 75, true),
      coachingFeedback: {
        summary: "Expressive emotional delivery with strong dynamic expansion. Pitch centering improved significantly from previous session.",
        strengths: [
          "Great dynamic contrast between verse piano and chorus forte (28 dB dynamic range)",
          "Consistent 5.7 Hz vibrato during the final sustained notes",
          "Accurate interval jumps to F4 and G4"
        ],
        areas_for_improvement: [
          "Slight neck tension pushing F4 sharp by +18 cents on the first chorus line",
          "Ensure soft palate remains vaulted during high vowels"
        ],
        recommended_drills: [
          {
            title: "Descending 5-Tone Sighs",
            focus: "Neck Tension Relief",
            description: "Sing 'Zoo' or 'Mmm' downward starting from high register, keeping throat loose."
          }
        ]
      },
      tags: ["Ballad", "Pop", "High Notes"],
      createdAt: new Date(Date.now() - 7 * 86400000),
    },
    {
      _id: "65a000000000000000000012",
      userId: demoUserId,
      title: "Queen - Somebody To Love (Bridge & Agility)",
      songTitle: "Somebody To Love",
      audioUrl: "/audio/sample-3.wav",
      audioFileName: "somebody-to-love.wav",
      fileSizeBytes: 3900000,
      durationSeconds: 135,
      overallScore: 91.4,
      grade: "A+",
      pitchAccuracyScore: 92.5,
      pitchStabilityScore: 90.0,
      centsDeviationAvg: 9.4,
      sharpTendencyPct: 8.0,
      flatTendencyPct: 9.0,
      inTunePercentage: 92.0,
      vibratoRateHz: 5.9,
      vibratoDepthCents: 94.0,
      vibratoScore: 94.0,
      dynamicRangeDb: 31.5,
      peakDb: -2.1,
      breathPausesCount: 14,
      lowestNote: "C3",
      highestNote: "A4",
      rangeSemitones: 21,
      voiceTypeDetected: "Tenor",
      timbreClarityScore: 93.0,
      spectralCentroidHz: 2450,
      resonanceProfile: "Optimal Forward Placement",
      pitchCurve: generatePitchCurveData(58, 85, true),
      coachingFeedback: {
        summary: "Masterclass execution! Pristine pitch accuracy (92.5%) and rich singer's formant ring around 2.45 kHz.",
        strengths: [
          "Superb pitch center: average deviation under 10 cents",
          "Full 21 semitone range utilized effortlessly",
          "Gorgeous natural vibrato oscillation with 94 cents depth"
        ],
        areas_for_improvement: [
          "Maintain breath support on the last 2 seconds of the final sustained A4 note"
        ],
        recommended_drills: [
          {
            title: "Octave Siren Glides",
            focus: "Smoothing Upper Register Transitions",
            description: "Glide continuously across break point on 'Oo' into 'Ah' without dynamic breaking."
          }
        ]
      },
      tags: ["Rock", "Agility", "Vocal Power"],
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      _id: "65a000000000000000000013",
      userId: demoUserId,
      title: "Pentatonic Runs & Vocal Agility Drills",
      songTitle: "Melodic Runs Exercise",
      audioUrl: "/audio/sample-4.wav",
      audioFileName: "vocal-runs.wav",
      fileSizeBytes: 2100000,
      durationSeconds: 85,
      overallScore: 89.8,
      grade: "A",
      pitchAccuracyScore: 90.2,
      pitchStabilityScore: 88.0,
      centsDeviationAvg: 11.1,
      sharpTendencyPct: 12.0,
      flatTendencyPct: 10.0,
      inTunePercentage: 89.0,
      vibratoRateHz: 5.6,
      vibratoDepthCents: 75.0,
      vibratoScore: 90.0,
      dynamicRangeDb: 24.0,
      peakDb: -4.5,
      breathPausesCount: 9,
      lowestNote: "D3",
      highestNote: "G#4",
      rangeSemitones: 18,
      voiceTypeDetected: "Tenor",
      timbreClarityScore: 89.0,
      spectralCentroidHz: 2010,
      resonanceProfile: "Optimal Forward Placement",
      pitchCurve: generatePitchCurveData(57, 70, true),
      coachingFeedback: {
        summary: "Nimble vocal agility and crisp note articulation. Every interval in the fast runs was defined without blurring.",
        strengths: [
          "Crystal-clear pitch separation between chromatic and pentatonic notes",
          "Stable resonance without strain",
          "Consistent vocal energy throughout the phrases"
        ],
        areas_for_improvement: [
          "Slight rushing of the tempo on descending triplet runs"
        ],
        recommended_drills: [
          {
            title: "Metronome R&B Trills",
            focus: "Micro-Timing & Rhythmic Precision",
            description: "Practice vocal runs at 70 BPM with metronome, accenting every 4th note."
          }
        ]
      },
      tags: ["Agility", "R&B", "Drills"],
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
  ];

  const defaultGoals = [
    {
      _id: "65a000000000000000000021",
      userId: demoUserId,
      title: "Hit 90%+ Pitch Accuracy in 5 Sessions",
      description: "Perform 5 practice sessions maintaining tight intonation within 15 cents.",
      category: "PITCH_ACCURACY",
      targetValue: 5,
      currentValue: 4,
      unit: "sessions",
      deadline: new Date(Date.now() + 10 * 86400000),
      isCompleted: false,
    },
    {
      _id: "65a000000000000000000022",
      userId: demoUserId,
      title: "Reach 500 Practice Minutes This Month",
      description: "Consistent daily practice to build vocal stamina and muscle memory.",
      category: "PRACTICE_TIME",
      targetValue: 500,
      currentValue: 495,
      unit: "minutes",
      deadline: new Date(Date.now() + 6 * 86400000),
      isCompleted: false,
    },
    {
      _id: "65a000000000000000000023",
      userId: demoUserId,
      title: "Extend Upper Vocal Range to High B4",
      description: "Safely expand mixed voice resonance without laryngeal constriction.",
      category: "RANGE_EXPANSION",
      targetValue: 71, // MIDI 71 = B4
      currentValue: 69, // MIDI 69 = A4
      unit: "note",
      deadline: new Date(Date.now() + 20 * 86400000),
      isCompleted: false,
    },
    {
      _id: "65a000000000000000000024",
      userId: demoUserId,
      title: "Maintain 14-Day Practice Streak",
      description: "Practice at least 15 minutes each consecutive day.",
      category: "DAILY_STREAK",
      targetValue: 14,
      currentValue: 12,
      unit: "days",
      deadline: new Date(Date.now() + 3 * 86400000),
      isCompleted: false,
    },
    {
      _id: "65a000000000000000000025",
      userId: demoUserId,
      title: "Master 5.5 - 6.0 Hz Vibrato Rate",
      description: "Stabilize vibrato frequency in the classical-pop gold standard window.",
      category: "VIBRATO_STABILITY",
      targetValue: 100,
      currentValue: 100,
      unit: "%",
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 86400000),
    },
  ];

  const defaultAchievements = [
    {
      _id: "65a000000000000000000030",
      userId: demoUserId,
      badgeKey: "first-upload",
      title: "First Upload",
      description: "Uploaded and processed your maiden vocal take into the studio.",
      icon: "Mic",
      category: "MILESTONE",
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 86400000),
      tier: "Bronze",
      points: 50,
    },
    {
      _id: "65a000000000000000000031",
      userId: demoUserId,
      badgeKey: "streak-7",
      title: "7 Day Streak",
      description: "Completed 7 consecutive days of vocal practice without missing a beat.",
      icon: "Flame",
      category: "DEDICATION",
      progress: 7,
      maxProgress: 7,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 5 * 86400000),
      tier: "Silver",
      points: 150,
    },
    {
      _id: "65a000000000000000000032",
      userId: demoUserId,
      badgeKey: "streak-30",
      title: "30 Day Streak",
      description: "A full month of continuous dedication and vocal discipline.",
      icon: "Zap",
      category: "DEDICATION",
      progress: 12,
      maxProgress: 30,
      isUnlocked: false,
      tier: "Diamond",
      points: 500,
    },
    {
      _id: "65a000000000000000000033",
      userId: demoUserId,
      badgeKey: "pitch-master",
      title: "Pitch Master",
      description: "Achieved pristine pitch accuracy of 95%+ in an analyzed practice take.",
      icon: "Crosshair",
      category: "INTONATION",
      progress: 92,
      maxProgress: 95,
      isUnlocked: false,
      tier: "Gold",
      points: 300,
    },
    {
      _id: "65a000000000000000000034",
      userId: demoUserId,
      badgeKey: "consistency-king",
      title: "Consistency King",
      description: "Completed 20+ vocal practice sessions or 5 sessions in a single week.",
      icon: "Crown",
      category: "DEDICATION",
      progress: 14,
      maxProgress: 20,
      isUnlocked: false,
      tier: "Gold",
      points: 350,
    },
    {
      _id: "65a000000000000000000035",
      userId: demoUserId,
      badgeKey: "vibrato-virtuoso",
      title: "Vibrato Virtuoso",
      description: "Sustained ideal vibrato oscillation within 5.2 - 6.5 Hz window for 5+ seconds.",
      icon: "Activity",
      category: "VIBRATO",
      progress: 100,
      maxProgress: 100,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 6 * 86400000),
      tier: "Silver",
      points: 175,
    },
    {
      _id: "65a000000000000000000036",
      userId: demoUserId,
      badgeKey: "range-2-octaves",
      title: "Two-Octave Titan",
      description: "Demonstrated a vocal span exceeding 24 semitones in analyzed sessions.",
      icon: "Music",
      category: "RANGE",
      progress: 21,
      maxProgress: 24,
      isUnlocked: false,
      tier: "Silver",
      points: 200,
    },
    {
      _id: "65a000000000000000000037",
      userId: demoUserId,
      badgeKey: "high-c-club",
      title: "The High C Club (C5)",
      description: "Sustained a resonant, unforced C5 note in mixed voice.",
      icon: "Sparkles",
      category: "RANGE",
      progress: 80,
      maxProgress: 100,
      isUnlocked: false,
      tier: "Diamond",
      points: 400,
    },
  ];

  const defaultReports = [
    {
      _id: "65a000000000000000000041",
      userId: demoUserId,
      title: "Vocal Performance Evaluation - Week 38",
      reportPeriod: "WEEKLY",
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(),
      summary: {
        totalSessions: 6,
        totalMinutesPracticed: 168,
        averageScore: 89.2,
        pitchAccuracyAvg: 90.1,
        stabilityAvg: 88.4,
        vibratoConsistencyAvg: 89.5,
        rangeCovered: "C3 - A4 (21 Semitones)",
        trendPitch: "UP",
        trendDynamics: "UP",
      },
      keyStrengths: [
        "Intonation deviation dropped from 16.2 to 9.4 cents (42% accuracy improvement)",
        "Upper register expanded cleanly to sustained A4 without pitch fracture",
        "Vibrato speed normalized into optimal 5.6 - 5.9 Hz pocket"
      ],
      growthAreas: [
        "Diaphragmatic support engagement on long phrase endings to avoid subtle flat sags",
        "Maintain vocal tract width on vowel /ee/ above F4"
      ],
      prescribedWarmups: [
        {
          title: "Lip Trills with Octave Glides",
          focus: "Airflow Support & Vocal Fold Elasticity",
          instructions: "Perform 5 minutes of gentle bubble trills gliding through break point into head voice."
        },
        {
          title: "Nasal 'Ming' Phonation",
          focus: "Resonance Vaulting",
          instructions: "Sustain /ng/ feeling bone vibration in the nasal bridge, transitioning to /ee/."
        }
      ],
      createdAt: new Date(),
    },
  ];

  const defaultNotifications = [
    {
      _id: "65a000000000000000000051",
      userId: demoUserId,
      title: "🔥 12-Day Practice Streak!",
      message: "You've maintained your singing streak for 12 days in a row! 2 days until your 14-day milestone.",
      type: "STREAK_WARNING",
      priority: "HIGH",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
    {
      _id: "65a000000000000000000052",
      userId: demoUserId,
      title: "🏆 Achievement Unlocked: First Upload",
      message: "Congratulations! You earned 50 XP for uploading and analyzing your maiden practice take.",
      type: "BADGE_UNLOCKED",
      priority: "MEDIUM",
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      _id: "65a000000000000000000053",
      userId: demoUserId,
      title: "📊 Weekly Performance Report Ready",
      message: "Your vocal health and performance evaluation for Week 38 is now available to review.",
      type: "ANALYSIS_READY",
      priority: "LOW",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      _id: "65a000000000000000000054",
      userId: demoUserId,
      title: "🎯 Goal Progress Milestone: 99% Complete",
      message: "You have completed 495 of 500 practice minutes this month! Almost there.",
      type: "GOAL_ACHIEVED",
      priority: "MEDIUM",
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
  ];

  // Load into memory store
  memoryStore.users = [defaultUser];
  memoryStore.sessions = sampleSessions;
  memoryStore.goals = defaultGoals;
  memoryStore.achievements = defaultAchievements;
  memoryStore.reports = defaultReports;
  memoryStore.notifications = defaultNotifications;

  // If MongoDB connected, sync into MongoDB collections
  if (isConnectedToMongo) {
    try {
      const userExists = await User.findOne({ email: defaultUser.email });
      if (!userExists) {
        await User.create(defaultUser);
        Logger.info("[Seed] User synced to MongoDB.");
      }
      const sessionCount = await Session.countDocuments();
      if (sessionCount === 0) {
        await Session.insertMany(sampleSessions);
        Logger.info("[Seed] Sessions synced to MongoDB.");
      }
      const recordingCount = await Recording.countDocuments();
      if (recordingCount === 0) {
        for (const s of sampleSessions) {
          const rec = await Recording.create({
            userId: s.userId,
            title: s.title,
            audioUrl: s.audioUrl,
            duration: s.durationSeconds,
            uploadDate: s.createdAt,
            fileSize: s.fileSizeBytes,
            format: "wav",
            sampleRate: 22050,
            channels: 1,
            tags: s.tags,
            isArchived: false,
          });

          await Analysis.create({
            recordingId: rec._id,
            userId: s.userId,
            pitchAccuracy: s.pitchAccuracyScore,
            tempoConsistency: 88.0,
            vocalRange: {
              lowestNote: s.lowestNote,
              highestNote: s.highestNote,
              semitones: s.rangeSemitones,
              octaves: Math.round((s.rangeSemitones / 12) * 10) / 10,
              voiceType: s.voiceTypeDetected,
            },
            loudnessScore: s.overallScore,
            breathingScore: 84.0,
            confidenceScore: 85.0,
            overallPerformanceScore: s.overallScore,
            vibrato: {
              detected: true,
              rateHz: s.vibratoRateHz,
              depthCents: s.vibratoDepthCents,
              regularity: 88.0,
            },
            pitchCurve: s.pitchCurve,
            aiFeedback: {
              summary: s.coachingFeedback.summary,
              strengths: s.coachingFeedback.strengths,
              areasForImprovement: s.coachingFeedback.areas_for_improvement,
              drills: s.coachingFeedback.recommended_drills,
            },
          });

          await PracticeSession.create({
            userId: s.userId,
            recordingId: rec._id,
            title: s.title,
            sessionType: "SONG_REHEARSAL",
            startTime: s.createdAt,
            endTime: new Date(new Date(s.createdAt).getTime() + s.durationSeconds * 1000),
            durationMinutes: Math.max(1, Math.round(s.durationSeconds / 60)),
            perceivedDifficulty: 3,
            vocalFatigueLevel: 2,
            mood: "CONFIDENT",
            notes: (s as any).userNotes || "",
            status: "COMPLETED",
            tags: s.tags,
            audioUrl: s.audioUrl,
            overallScore: s.overallScore,
          });
        }
        Logger.info("[Seed] Recordings, Analyses, and PracticeSessions synced to MongoDB.");
      }
      const goalCount = await Goal.countDocuments();
      if (goalCount === 0) {
        await Goal.insertMany(defaultGoals);
        Logger.info("[Seed] Goals synced to MongoDB.");
      }
      const achievementCount = await Achievement.countDocuments();
      if (achievementCount === 0) {
        await Achievement.insertMany(defaultAchievements);
        Logger.info("[Seed] Achievements synced to MongoDB.");
      }
      const reportCount = await Report.countDocuments();
      if (reportCount === 0) {
        await Report.insertMany(defaultReports);
        Logger.info("[Seed] Reports synced to MongoDB.");
      }
      const notifCount = await Notification.countDocuments();
      if (notifCount === 0) {
        await Notification.insertMany(defaultNotifications);
        Logger.info("[Seed] Notifications synced to MongoDB.");
      }
    } catch (e: any) {
      Logger.warn("[Seed] MongoDB sync skipped:", e.message);
    }
  }

  Logger.info(`[Store] Initialized: ${memoryStore.sessions.length} sessions, ${memoryStore.goals.length} goals, ${memoryStore.achievements.length} achievements ready.`);
};
