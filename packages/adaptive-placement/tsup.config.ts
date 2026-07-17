import { defineConfig } from "tsup";

// Dual ESM + CJS build with type declarations. No dependencies, no externals.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  minify: false,
});
