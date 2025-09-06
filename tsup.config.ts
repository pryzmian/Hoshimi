import { defineConfig } from "tsup";

/**
 * The configuration for the tsup build tool.
 */
export default defineConfig({
    dts: true,
    format: ["esm", "cjs"],
    entry: ["./src/index.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    ignoreWatch: ["**/node_modules/**", "**/.git/**"],
    tsconfig: "./tsconfig.json",
});
