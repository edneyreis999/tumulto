import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4180",
    viewport: { width: 1280, height: 720 },
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "TUMULTO_DESIGN_PORT=4180 TUMULTO_TEST_MODE=1 node tools/game-design-server.js",
    url: "http://127.0.0.1:4180",
    reuseExistingServer: false,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
