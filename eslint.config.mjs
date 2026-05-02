import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  {
    globals: {
      setup: "readonly",
      draw: "readonly",
      windowResized: "readonly",
      createCanvas: "readonly",
      windowWidth: "readonly",
      windowHeight: "readonly",
      fill: "readonly",
      strokeWeight: "readonly",
      circle: "readonly",
      resizeCanvas: "readonly",
    },
    rules: {
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^(setup|draw|windowResized)$" },
      ],
    },
  },
]);
