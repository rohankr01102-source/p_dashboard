const http = require("http");

async function run() {
  process.env.PORT = "5999";
  process.env.NODE_ENV = "test";

  const app = require("./dist/app").default;
  const server = app.listen(5999);

  let passed = 0;
  let failed = 0;

  function request(method, path, body, token, customHeaders = {}) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers = {
        "Content-Type": "application/json",
        ...customHeaders,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (payload) headers["Content-Length"] = Buffer.byteLength(payload);

      const req = http.request(
        {
          hostname: "localhost",
          port: 5999,
          path,
          method,
          headers,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch (e) {}
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: json,
              raw: data,
            });
          });
        }
      );

      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  function assert(name, condition, details) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - Details: ${JSON.stringify(details)}`);
      failed++;
    }
  }

  try {
    // 1. Health checks & Security Headers
    const h1 = await request("GET", "/health/live");
    assert("Health /health/live returns 200", h1.status === 200, h1);
    assert(
      "Security headers present (X-Content-Type-Options: nosniff, X-Frame-Options: DENY)",
      h1.headers["x-content-type-options"] === "nosniff" &&
      h1.headers["x-frame-options"] === "DENY",
      h1.headers
    );
    assert(
      "Request ID attached to response header (X-Request-Id)",
      Boolean(h1.headers["x-request-id"]),
      h1.headers
    );

    const h2 = await request("GET", "/health/ready");
    assert("Health /health/ready returns 200", h2.status === 200, h2);

    // 2. Unauthenticated access guards & centralized envelope verification
    const u1 = await request("GET", "/api/sessions");
    assert(
      "GET /api/sessions unauthenticated rejected with 401 and centralized error envelope",
      u1.status === 401 &&
      u1.body?.success === false &&
      u1.body?.meta?.timestamp &&
      u1.body?.meta?.requestId,
      u1
    );

    const u2 = await request("POST", "/api/goals", { title: "Test Goal" });
    assert("POST /api/goals unauthenticated rejected with 401", u2.status === 401, u2);

    // 3. Demo token generation
    const d1 = await request("POST", "/api/auth/demo");
    assert("POST /api/auth/demo generates token", d1.status === 200 && d1.body?.data?.token, d1);
    const token = d1.body?.data?.token;

    // 4. Authenticated core endpoints
    const s1 = await request("GET", "/api/sessions", null, token);
    assert("GET /api/sessions with token returns 200", s1.status === 200, s1);

    const g1 = await request("GET", "/api/goals", null, token);
    assert("GET /api/goals with token returns 200", g1.status === 200, g1);

    const prof = await request("GET", "/api/users/profile", null, token);
    assert("GET /api/users/profile returns 200", prof.status === 200 && prof.body?.data?.email, prof);

    // 5. Preferences update validation
    const pBad = await request("PUT", "/api/users/preferences", "not-an-object", token);
    assert("PUT /api/users/preferences with invalid payload rejected with 400/422", pBad.status === 400 || pBad.status === 422, pBad);

    const pGood = await request("PUT", "/api/users/preferences", { darkTheme: true, notifications: false }, token);
    assert("PUT /api/users/preferences with valid payload returns 200", pGood.status === 200, pGood);

    // 6. Notifications & Dashboard
    const n1 = await request("GET", "/api/notifications/unread-count", null, token);
    assert("GET /api/notifications/unread-count returns 200", n1.status === 200, n1);

    const dash = await request("GET", "/api/dashboard/overview", null, token);
    assert("GET /api/dashboard/overview returns 200", dash.status === 200, dash);

    const recs = await request("GET", "/api/recordings", null, token);
    assert("GET /api/recordings returns 200", recs.status === 200, recs);

    // 7. Security: Auth input validation & bad password defense
    const badLogin1 = await request("POST", "/api/auth/login", { email: "test@example.com", password: "" });
    assert("POST /api/auth/login empty password rejected with 422", badLogin1.status === 422, badLogin1);

    const badLogin2 = await request("POST", "/api/auth/login", { email: "nonexistent@example.com", password: "wrongpassword123" });
    assert("POST /api/auth/login non-existent user rejected with 401", badLogin2.status === 401, badLogin2);

    // 8. 404 Route Not Found handling
    const notFound = await request("GET", "/api/non-existent-route-for-testing");
    assert(
      "404 Route Not Found returns standardized error envelope with ROUTE_NOT_FOUND code",
      notFound.status === 404 &&
      notFound.body?.success === false &&
      notFound.body?.error?.code === "ROUTE_NOT_FOUND",
      notFound
    );

    console.log("-----------------------------------------");
    console.log(`TOTAL HTTP INTEGRATION: Passed=${passed}, Failed=${failed}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
