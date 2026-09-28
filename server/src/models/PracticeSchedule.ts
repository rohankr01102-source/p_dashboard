import mongoose, { Schema, Document, Model } from "mongoose";

export type ScheduleFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";

export type VocalFocusArea =
  | "WARM_UP"
  | "PITCH_CONTROL"
  | "BELTING"
  | "HEAD_VOICE"
  | "MIXED_VOICE"
  | "AGILITY"
  | "REPERTOIRE";

export interface IPracticeSchedule extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  frequency: ScheduleFrequency;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  preferredTime: string; // "HH:mm" (24-hour format)
  durationMinutes: number;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  targetVocalDrills: string[];
  focusArea: VocalFocusArea;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  isTodayScheduled: boolean;
  formattedTime: string;
}

export interface PracticeScheduleModel extends Model<IPracticeSchedule> {
  getActiveSchedulesForDay(
    dayOfWeek: number,
    timeWindow?: { start: string; end: string }
  ): Promise<IPracticeSchedule[]>;
  getUserScheduleWeeklyOverview(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    activeSchedulesCount: number;
    weeklyPlannedMinutes: number;
    daysWithSchedules: number[];
    schedulesByDay: Record<number, Array<{ title: string; preferredTime: string; durationMinutes: number }>>;
  }>;
}

const PracticeScheduleSchema = new Schema<IPracticeSchedule, PracticeScheduleModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Schedule must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Schedule title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
      default: "Daily Vocal Routine",
    },
    frequency: {
      type: String,
      enum: {
        values: ["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"],
        message: "{VALUE} is not a valid frequency",
      },
      default: "DAILY",
      index: true,
    },
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6], // Default all 7 days for DAILY
      validate: {
        validator: (days: number[]) =>
          days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "Days of week must be integers between 0 (Sunday) and 6 (Saturday)",
      },
    },
    preferredTime: {
      type: String,
      required: [true, "Preferred practice time is required (HH:mm)"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Preferred time must be in HH:mm 24-hour format"],
      default: "09:00",
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: [5, "Practice duration must be at least 5 minutes"],
      max: [300, "Practice duration cannot exceed 300 minutes"],
      default: 30,
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderMinutesBefore: {
      type: Number,
      enum: [5, 10, 15, 30, 60],
      default: 15,
    },
    targetVocalDrills: {
      type: [String],
      default: ["Lip Trills", "Sirens", "Solfege Scales"],
    },
    focusArea: {
      type: String,
      enum: {
        values: [
          "WARM_UP",
          "PITCH_CONTROL",
          "BELTING",
          "HEAD_VOICE",
          "MIXED_VOICE",
          "AGILITY",
          "REPERTOIRE",
        ],
        message: "{VALUE} is not a valid focus area",
      },
      default: "WARM_UP",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PracticeScheduleSchema.index({ userId: 1, isActive: 1 });
PracticeScheduleSchema.index({ isActive: 1, preferredTime: 1 });
PracticeScheduleSchema.index({ isActive: 1, daysOfWeek: 1 });

// Virtuals
PracticeScheduleSchema.virtual("isTodayScheduled").get(function (this: IPracticeSchedule) {
  if (!this.isActive) return false;
  const todayDay = new Date().getDay(); // 0 to 6
  return this.daysOfWeek.includes(todayDay);
});

PracticeScheduleSchema.virtual("formattedTime").get(function (this: IPracticeSchedule) {
  if (!this.preferredTime) return "";
  const [hoursStr, minsStr] = this.preferredTime.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minsStr} ${ampm}`;
});

// Pre-save hook: align daysOfWeek with frequency if preset
PracticeScheduleSchema.pre<IPracticeSchedule>("save", function (next) {
  if (this.frequency === "DAILY") {
    this.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  } else if (this.frequency === "WEEKDAYS") {
    this.daysOfWeek = [1, 2, 3, 4, 5];
  } else if (this.frequency === "WEEKENDS") {
    this.daysOfWeek = [0, 6];
  }
  next();
});

// Static Methods
PracticeScheduleSchema.statics.getActiveSchedulesForDay = async function (
  dayOfWeek: number,
  timeWindow?: { start: string; end: string }
) {
  const query: any = {
    isActive: true,
    daysOfWeek: dayOfWeek,
  };

  if (timeWindow) {
    query.preferredTime = {
      $gte: timeWindow.start,
      $lte: timeWindow.end,
    };
  }

  return await this.find(query).populate("userId", "name email");
};

PracticeScheduleSchema.statics.getUserScheduleWeeklyOverview = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

  const schedules = await this.find({ userId: userObjectId, isActive: true });

  let weeklyPlannedMinutes = 0;
  const daysSet = new Set<number>();
  const schedulesByDay: Record<
    number,
    Array<{ title: string; preferredTime: string; durationMinutes: number }>
  > = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  for (const s of schedules) {
    for (const day of s.daysOfWeek) {
      daysSet.add(day);
      weeklyPlannedMinutes += s.durationMinutes;
      schedulesByDay[day].push({
        title: s.title,
        preferredTime: s.preferredTime,
        durationMinutes: s.durationMinutes,
      });
    }
  }

  return {
    activeSchedulesCount: schedules.length,
    weeklyPlannedMinutes,
    daysWithSchedules: Array.from(daysSet).sort((a, b) => a - b),
    schedulesByDay,
  };
};

PracticeScheduleSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const PracticeSchedule = mongoose.model<IPracticeSchedule, PracticeScheduleModel>(
  "PracticeSchedule",
  PracticeScheduleSchema
);
