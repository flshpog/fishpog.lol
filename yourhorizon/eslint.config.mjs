import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Static export disables Next.js Image optimization, so <img> is correct
      "@next/next/no-img-element": "off",
      // Google Fonts loaded via <link> in layout is fine for static export
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
