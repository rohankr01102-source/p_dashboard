import mongoose from "mongoose";
import { ENV } from "./env";
import { Logger } from "../utils/logger";

export let isConnectedToMongo = false;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", false);
    Logger.info(`[Database] Attempting connection to MongoDB at ${ENV.MONGO_URI}...`);

    // Attempt with 3-second timeout for fast startup failure detection
    await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnectedToMongo = true;
    Logger.info("[Database] Connected successfully to MongoDB.");
  } catch (error: any) {
    Logger.warn(`[Database] MongoDB connection failed (${error.message}). Initializing resilient in-memory data store.`);
    isConnectedToMongo = false;
  }
};
