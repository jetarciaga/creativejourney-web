import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// The pre-rebuild Vite app still lives under src/ until Stage 7 deletes it
// (see docs/decisions.md D-008). It is linted by nothing right now — its
// own eslint.config.js was this file, and it has been replaced wholesale
// rather than merged, since the plugin set (react, react-hooks,
// react-refresh) is gone from package.json. Ignoring src/ here is
// deliberate, not an oversight: don't spend lint effort on code that is
// being deleted.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    ".venv/**",
    "next-env.d.ts",
    "src/**",
  ]),
]);

export default eslintConfig;
