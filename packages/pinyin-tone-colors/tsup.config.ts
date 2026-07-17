import { defineConfig } from "tsup";

// Dual ESM + CJS build with type declarations. The React wrapper is a separate
// entry so the core stays zero-dependency; React is marked external (peer dep).
export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["react", "react/jsx-runtime"],
});
