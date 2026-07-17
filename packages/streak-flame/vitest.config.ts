import { defineConfig } from "vitest/config";

// Pure tier logic + a React static-render test — both run under node.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
