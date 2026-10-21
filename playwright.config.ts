import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3210", headless: true },
  reporter: "list",
  timeout: 20000,
});
