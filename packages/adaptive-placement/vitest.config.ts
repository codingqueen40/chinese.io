import { defineConfig } from "vitest/config";

// Pure module → node environment, no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
