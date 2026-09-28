// Barrel export for all Vocalytics AI MongoDB Schemas and Models

// 1. User Model
export * from "./User";

// 2. PracticeSession Model
export * from "./PracticeSession";

// 3. Recording Model
export * from "./Recording";

// 4. Analysis Model
export * from "./Analysis";

// 5. Goal Model
export * from "./Goal";

// 6. Achievement Model
export * from "./Achievement";

// 7. Notification Model
export * from "./Notification";

// 8. Feedback Model
export * from "./Feedback";

// 9. Playlist Model
export * from "./Playlist";

// 10. PracticeSchedule Model
export * from "./PracticeSchedule";

// Backwards compatibility exports
export { Session, ISession, ICoachingFeedback } from "./Session";
export * from "./Report";
