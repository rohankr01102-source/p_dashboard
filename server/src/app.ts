import express, { Application, Request, Response } from "express";
import { ENV } from "./config/env";
import { isConnectedToMongo } from "./config/db";
import masterRoutes from "./routes";
import {
  preBodySecurityMiddleware,
  postBodySecurityMiddleware,
  globalApiLimiter,
  loggingMiddleware,
  errorMiddleware,
  setupGlobalExceptionHandlers,
} from "./middlewares";
import { ApiResponse } from "./utils/apiResponse";

// Initialize global process exception & rejection safety nets
setupGlobalExceptionHandlers();

const app: Application = express();

// Trust reverse proxy if running behind load balancers / NGINX / Cloudflare
if (ENV.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 1. Pre-body Security Suite: Request ID, Helmet, CORS, and Security Headers
app.use(preBodySecurityMiddleware);

// 2. Global API Rate Limiting (express-rate-limit)
app.use("/api", globalApiLimiter);

// 3. Body parsers with safe payload size limit (must precede body sanitizers)
// Note: Audio uploads bypass body-parser via multer; JSON API payloads cap at 1mb.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. Post-body Input Sanitization: NoSQL injection defense on req.body/query/params & HPP
app.use(postBodySecurityMiddleware);

// 5. Enterprise Request Logger (Morgan stream integrated with structured Logger)
app.use(loggingMiddleware);

// 5. Static file serving with caching
app.use("/uploads", express.static(ENV.UPLOAD_DIR, { maxAge: "1d" }));

// 6. Health and Readiness Probes for Kubernetes / Docker / DevOps Monitoring
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "Vocalytics AI Core Backend",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    environment: ENV.NODE_ENV,
    database: isConnectedToMongo ? "connected" : "resilient-in-memory",
  });
};

const readyHandler = (_req: Request, res: Response) => {
  res.json({
    status: "ready",
    store: isConnectedToMongo ? "mongodb" : "memory-store",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
};

app.get(["/health", "/health/live", "/api/health"], healthHandler);
app.get(["/ready", "/health/ready", "/api/ready"], readyHandler);

// 7. Master API Routes
app.use("/api", masterRoutes);

// 8. 404 Route Not Found Handler
app.use((req: Request, res: Response) => {
  ApiResponse.error(
    res,
    `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    404,
    "ROUTE_NOT_FOUND"
  );
});

// 9. Centralized Error Handler (Global Exception Handling)
app.use(errorMiddleware);

export default app;
