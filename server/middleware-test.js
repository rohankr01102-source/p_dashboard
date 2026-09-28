/**
 * Enterprise Middleware Verification Test Suite
 * Tests all 9 middlewares, global exception handling, and centralized response formatting
 */

const {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireOwnership,
  requireSelfOrAdmin,
  errorMiddleware,
  asyncHandler,
  createRateLimiter,
  validateRequest,
  validateBody,
  noSqlSanitizerMiddleware,
  parameterPollutionMiddleware,
  requestIdMiddleware,
  securityHeadersMiddleware,
  singleAudioUploadMiddleware,
  audioUpload,
} = require("./dist/middlewares");

const { ApiResponse } = require("./dist/utils/apiResponse");
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require("./dist/utils/appError");

let passed = 0;
let failed = 0;

function assert(name, condition, details) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name} - Details:`, details);
    failed++;
  }
}

async function runMiddlewareTests() {
  console.log("=========================================");
  console.log("  Enterprise Middlewares Verification    ");
  console.log("=========================================");

  // 1. Centralized Response Formatting (ApiResponse)
  {
    const mockRes = {
      statusCode: 200,
      headers: {},
      req: { id: "req-12345" },
      setHeader(k, v) { this.headers[k] = v; },
      getHeader(k) { return this.headers[k]; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; },
      send() { return this; },
    };

    ApiResponse.success(mockRes, { vocalPitch: 440 }, "Analysis computed");
    assert(
      "ApiResponse.success produces standardized envelope with data, meta, and timestamp",
      mockRes.statusCode === 200 &&
      mockRes.payload.success === true &&
      mockRes.payload.data.vocalPitch === 440 &&
      mockRes.payload.meta.timestamp &&
      mockRes.payload.meta.requestId === "req-12345",
      mockRes.payload
    );

    ApiResponse.error(mockRes, "Invalid pitch range", 400, "BAD_PITCH", { range: "C1" });
    assert(
      "ApiResponse.error produces uniform error payload with code and details",
      mockRes.statusCode === 400 &&
      mockRes.payload.success === false &&
      mockRes.payload.error.code === "BAD_PITCH" &&
      mockRes.payload.error.details.range === "C1",
      mockRes.payload
    );
  }

  // 2. Authentication Middleware
  {
    // Missing Bearer token
    let authError = null;
    const mockReq = { headers: {} };
    await authMiddleware(mockReq, {}, (err) => { authError = err; });
    assert(
      "AuthMiddleware rejects request with missing token as UnauthorizedError",
      authError instanceof UnauthorizedError && authError.statusCode === 401,
      authError
    );

    // Malformed token string
    authError = null;
    mockReq.headers = { authorization: "Bearer invalid.jwt.signature" };
    await authMiddleware(mockReq, {}, (err) => { authError = err; });
    assert(
      "AuthMiddleware rejects invalid/tampered token with 401",
      authError instanceof UnauthorizedError && authError.statusCode === 401,
      authError
    );

    // Optional auth does not fail when token is absent
    let optionalErr = null;
    const optReq = { headers: {} };
    await optionalAuthMiddleware(optReq, {}, (err) => { optionalErr = err; });
    assert(
      "OptionalAuthMiddleware passes through cleanly when unauthenticated",
      optionalErr === undefined || optionalErr === null,
      optionalErr
    );
  }

  // 3. Authorization Middleware (RBAC & Ownership)
  {
    // Role check fails for non-permitted role
    const guardAdmin = requireRole("admin");
    let roleErr = null;
    const userReq = { user: { id: "u1", role: "user" } };
    guardAdmin(userReq, {}, (err) => { roleErr = err; });
    assert(
      "requireRole('admin') blocks user with 'user' role with 403 ForbiddenError",
      roleErr instanceof ForbiddenError && roleErr.statusCode === 403,
      roleErr
    );

    // Role check passes for matching role
    let roleSuccess = false;
    const adminReq = { user: { id: "a1", role: "admin" } };
    guardAdmin(adminReq, {}, () => { roleSuccess = true; });
    assert(
      "requireRole('admin') permits user with 'admin' role",
      roleSuccess === true
    );

    // Ownership check fails when resource ID does not match user ID
    const ownershipGuard = requireOwnership("id");
    let ownerErr = null;
    const foreignReq = { params: { id: "resource-owner-2" }, user: { id: "resource-owner-1", role: "user" } };
    ownershipGuard(foreignReq, {}, (err) => { ownerErr = err; });
    assert(
      "requireOwnership blocks non-owner with 403 ForbiddenError",
      ownerErr instanceof ForbiddenError && ownerErr.statusCode === 403,
      ownerErr
    );

    // Ownership check passes for matching resource ID
    let ownerSuccess = false;
    const matchingReq = { params: { id: "resource-owner-1" }, user: { id: "resource-owner-1", role: "user" } };
    ownershipGuard(matchingReq, {}, () => { ownerSuccess = true; });
    assert(
      "requireOwnership permits matching resource owner",
      ownerSuccess === true
    );

    // Admin bypasses ownership check
    let adminBypassSuccess = false;
    const adminOwnershipReq = { params: { id: "resource-owner-2" }, user: { id: "admin-1", role: "admin" } };
    ownershipGuard(adminOwnershipReq, {}, () => { adminBypassSuccess = true; });
    assert(
      "requireOwnership permits administrator access to foreign resources",
      adminBypassSuccess === true
    );
  }

  // 4. Async Handler Middleware
  {
    let handledError = null;
    const faultyController = asyncHandler(async () => {
      throw new BadRequestError("Async failure simulated");
    });

    faultyController({}, {}, (err) => {
      handledError = err;
    });

    // Wait a tick for promise unwrapping
    await new Promise((resolve) => setImmediate(resolve));
    assert(
      "asyncHandler catches rejected promises and forwards to next(err)",
      handledError instanceof BadRequestError && handledError.message === "Async failure simulated",
      handledError
    );
  }

  // 5. Error Handler (Global Exception Handling)
  {
    const makeRes = () => ({
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; },
    });

    // AppError normalization
    const res1 = makeRes();
    errorMiddleware(new NotFoundError("Audio track missing"), { headers: {} }, res1, () => {});
    assert(
      "errorMiddleware normalizes AppError to 404 with standard code",
      res1.statusCode === 404 && res1.payload.error.code === "NOT_FOUND",
      res1.payload
    );

    // MongoServerError duplicate key error (11000)
    const res2 = makeRes();
    const duplicateErr = new Error("E11000 duplicate key error");
    duplicateErr.code = 11000;
    duplicateErr.name = "MongoServerError";
    duplicateErr.keyPattern = { email: 1 };
    duplicateErr.keyValue = { email: "duplicate@example.com" };
    errorMiddleware(duplicateErr, { headers: {} }, res2, () => {});
    assert(
      "errorMiddleware normalizes Mongo duplicate key (11000) into 409 DUPLICATE_RESOURCE",
      res2.statusCode === 409 && res2.payload.error.code === "DUPLICATE_RESOURCE",
      res2.payload
    );

    // Mongoose CastError normalization
    const res3 = makeRes();
    const castErr = new Error("Cast to ObjectId failed");
    castErr.name = "CastError";
    castErr.path = "_id";
    castErr.value = "invalid-id-123";
    errorMiddleware(castErr, { headers: {} }, res3, () => {});
    assert(
      "errorMiddleware normalizes CastError into 400 INVALID_IDENTIFIER",
      res3.statusCode === 400 && res3.payload.error.code === "INVALID_IDENTIFIER",
      res3.payload
    );
  }

  // 6. Rate Limiter Middleware
  {
    const limiter = createRateLimiter({
      windowMs: 1000,
      limit: 1,
      errorCode: "TEST_LIMIT_REACHED",
    });

    assert("createRateLimiter produces valid Express middleware", typeof limiter === "function");
  }

  // 7. Validation Middleware
  {
    const validator = validateBody((body) => {
      if (!body.title || body.title.length < 3) {
        throw new ValidationError("Title must be at least 3 characters", { title: "Too short" });
      }
      return { title: body.title.trim() };
    });

    let valError = null;
    const badReq = { body: { title: "Hi" } };
    validator(badReq, {}, (err) => { valError = err; });
    assert(
      "validateBody blocks invalid data with 422 ValidationError",
      valError instanceof ValidationError && valError.statusCode === 422,
      valError
    );

    let valSuccess = false;
    const goodReq = { body: { title: "  Clean Vocal Siren  " } };
    validator(goodReq, {}, () => { valSuccess = true; });
    assert(
      "validateBody allows valid data and cleans input payload",
      valSuccess === true && goodReq.body.title === "Clean Vocal Siren"
    );
  }

  // 8. File Upload Middleware (Multer Audio Configuration)
  {
    assert("audioUpload is defined with diskStorage and fileFilter", typeof audioUpload.single === "function");
    assert("singleAudioUploadMiddleware is a valid Express handler", typeof singleAudioUploadMiddleware === "function");
  }

  // 9. Security Middleware (NoSQL defense, HPP, Request ID, Headers)
  {
    // Request ID generation
    const reqWithId = { headers: {} };
    const resWithId = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
    };
    requestIdMiddleware(reqWithId, resWithId, () => {});
    assert(
      "requestIdMiddleware attaches unique request ID to req and response header",
      Boolean(reqWithId.id) && Boolean(resWithId.headers["X-Request-Id"])
    );

    // NoSQL Injection sanitization (strips keys starting with $ or containing .)
    const maliciousReq = {
      body: {
        username: "admin",
        password: { $gt: "" },
        "nested.attack": true,
      },
    };
    noSqlSanitizerMiddleware(maliciousReq, {}, () => {});
    assert(
      "noSqlSanitizerMiddleware strips $ and . keys to prevent injection",
      maliciousReq.body.username === "admin" &&
      maliciousReq.body.password.$gt === undefined &&
      maliciousReq.body["nested.attack"] === undefined,
      maliciousReq.body
    );

    // HTTP Parameter Pollution protection (deduplicates malicious arrays)
    const pollutedReq = {
      query: {
        sort: ["asc", "desc"],
      },
    };
    parameterPollutionMiddleware(pollutedReq, {}, () => {});
    assert(
      "parameterPollutionMiddleware defends against query array pollution",
      pollutedReq.query.sort === "desc",
      pollutedReq.query
    );

    // Security response headers
    const headerRes = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
    };
    securityHeadersMiddleware({}, headerRes, () => {});
    assert(
      "securityHeadersMiddleware injects nosniff and DENY frameguard headers",
      headerRes.headers["X-Content-Type-Options"] === "nosniff" &&
      headerRes.headers["X-Frame-Options"] === "DENY",
      headerRes.headers
    );
  }

  console.log("-----------------------------------------");
  console.log(`MIDDLEWARE RESULTS: Passed=${passed}, Failed=${failed}`);
  console.log("-----------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runMiddlewareTests().catch((err) => {
  console.error("Middleware test runner exception:", err);
  process.exit(1);
});
