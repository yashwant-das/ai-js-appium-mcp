const js = require('@eslint/js');
const globals = require('globals');
const wdio = require('eslint-plugin-wdio');
const chaiFriendly = require('eslint-plugin-chai-friendly');

const RAW_SELECTOR = 'Use a screen object method instead of a raw selector.';

module.exports = [
  {
    ignores: ['allure-results/', 'allure-report/', 'test-results/', '.superpowers/']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.mocha,
        browser: 'readonly',
        driver: 'readonly',
        $: 'readonly',
        $$: 'readonly',
        expect: 'readonly'
      }
    },
    plugins: {
      wdio,
      'chai-friendly': chaiFriendly
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': 'error',
      'wdio/await-expect': 'error',
      'wdio/no-debug': 'error',
      'wdio/no-pause': 'error'
    }
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'CallExpression[callee.name=/^\\$\\$?$/]', message: RAW_SELECTOR },
        { selector: 'CallExpression[callee.property.name=/^\\$\\$?$/]', message: RAW_SELECTOR }
      ]
    }
  },
  {
    files: ['config/**/*.js', 'support/**/*.js', 'unit/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];
