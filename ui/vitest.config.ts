import { defineConfig } from "vitest/config";

// Unit tests for pure functions only (no DOM, no React plugins).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
