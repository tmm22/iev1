import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "./e2e/**"
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
