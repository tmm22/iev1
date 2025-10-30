import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Note: webServer intentionally omitted to avoid dev server coupling here.
  // Configure in CI or local with appropriate env when ready.
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
  },
});
