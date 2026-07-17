import { defineConfig } from "tsup";

// The component ships as JS; the stylesheet is shipped as-is at the package
// root (imported by consumers via "streak-flame/styles.css"). React is external.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["react", "react/jsx-runtime"],
});
