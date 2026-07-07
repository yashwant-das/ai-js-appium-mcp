const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        browser: "readonly",
        $: "readonly",
        $$: "readonly",
        expect: "readonly",
        process: "readonly",
        require: "readonly",
        __dirname: "readonly",
        module: "readonly",
        exports: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      wdio: require("eslint-plugin-wdio"),
      "chai-friendly": require("eslint-plugin-chai-friendly"),
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "no-unused-expressions": "off",
      "chai-friendly/no-unused-expressions": "error",
      "wdio/await-expect": "error",
      "wdio/no-debug": "error",
      "wdio/no-pause": "error",
    },
  },
  {
    files: ["tests/**/*.test.js"],
    rules: {
      "no-unused-expressions": "off",
      "chai-friendly/no-unused-expressions": "error",
    },
  },
  {
    files: ["wdio.conf.js"],
    rules: {
      "no-console": "off",
    },
  },
];
