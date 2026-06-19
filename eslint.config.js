// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // In React Native <Text>, HTML entities (&apos; etc.) are NOT decoded —
    // raw apostrophes/quotes in copy are correct, so this web-only rule is off.
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    ignores: ["dist/*"],
  },
]);
