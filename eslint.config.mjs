export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        fetch: "readonly"
      }
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-unused-vars": ["warn"],
      "no-console": "off",
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",
      "no-var": "error",
      "prefer-const": "error"
    }
  }
];
/**
 * Semicolon rule (explicit requirement)
 * ES6 modules
 * Browser APIs (fetch, navigator, etc.)
 * Arrow functions
 * Clean formatting
 */