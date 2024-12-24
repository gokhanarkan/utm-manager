import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const external = [
  ...Object.keys(packageJson.peerDependencies || {}),
  "react/jsx-runtime",
];

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.json",
    sourceMap: true,
    exclude: ["**/__tests__/**"],
  }),
];

export default [
  // Main package builds (ESM, CJS)
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins,
    external,
  },

  // React integration
  {
    input: "src/frameworks/react/index.tsx",
    output: [
      {
        file: "dist/react/index.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
    external: [...external, "react"],
  },

  // Next.js integration
  {
    input: "src/frameworks/next/index.tsx",
    output: [
      {
        file: "dist/next/index.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
    external: [...external, "react", "next/router"],
  },

  // Standalone browser build
  {
    input: "src/standalone.ts",
    output: [
      {
        file: "dist/utm-manager.min.js",
        format: "iife",
        name: "UTMManager",
        plugins: [terser()],
        sourcemap: true,
      },
      {
        file: "dist/utm-manager.js",
        format: "iife",
        name: "UTMManager",
        sourcemap: true,
      },
    ],
    plugins,
  },
];
