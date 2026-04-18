#!/usr/bin/env node

const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

const checks = [
  {
    name: "API index",
    path: "/api/v1",
    expectedStatus: 200,
  },
  {
    name: "Health check",
    path: "/api/v1/health",
    expectedStatus: 200,
  },
  {
    name: "Unauthorized me check",
    path: "/api/v1/auth/me",
    expectedStatus: 401,
  },
];

let failures = 0;

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`);
  if (response.status !== check.expectedStatus) {
    failures += 1;
    console.error(
      `FAIL ${check.name}: expected ${check.expectedStatus}, got ${response.status} (${check.path})`,
    );
    continue;
  }

  console.log(`PASS ${check.name}: ${response.status} (${check.path})`);
}

if (failures > 0) {
  process.exit(1);
}

console.log("API smoke test passed.");

