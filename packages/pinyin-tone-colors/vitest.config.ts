import { defineConfig } from "vitest/config";

// Pure modules → node environment. The React wrapper is tested via
// react-dom/server (static markup), which also runs under node — no jsdom.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
