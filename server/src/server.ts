import app from "./app";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { initSeedData } from "./services/store";
import { initBackgroundJobs, stopBackgroundJobs } from "./jobs";
import { Logger } from "./utils/logger";
import mongoose from "mongoose";

let server: any = null;

const startServer = async () => {
  try {
    console.log("=========================================");
    console.log("   Vocalytics AI - Enterprise Core API   ");
    console.log("=========================================");

    // Connect DB with resilient fallback
    await connectDB();

    // Initialize Store & Seed
    await initSeedData();

    // Start background analytics and maintenance jobs
    initBackgroundJobs();

    server = app.listen(ENV.PORT, () => {
      Logger.info(`[Vocalytics Server] Running on http://localhost:${ENV.PORT}`);
      Logger.info(`[API Base] http://localhost:${ENV.PORT}/api`);
      Logger.info(`[Health] http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (error) {
    Logger.error("[Fatal Startup Error]", error);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  Logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  stopBackgroundJobs();

  if (server) {
    server.close(async () => {
      Logger.info("[Server] HTTP server closed.");
      try {
        await mongoose.connection.close(false);
        Logger.info("[Database] MongoDB connection closed.");
      } catch (err) {}
      process.exit(0);
    });

    // Force shutdown after 10s if hanging
    setTimeout(() => {
      Logger.error("[Server] Forcefully terminating after timeout.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// NOTE: unhandledRejection + uncaughtException are registered by
// setupGlobalExceptionHandlers() inside app.ts — do not add duplicates here.

startServer();
