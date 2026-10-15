const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { ESLint } = require('eslint');

const root = path.join(__dirname, '..');
const MESSAGE = 'Use a screen object method instead of a raw selector.';

async function messagesFor(code, file) {
  const eslint = new ESLint({ cwd: root });
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) });
  return result.messages.map((m) => m.message);
}

test('raw $ and $$ calls are rejected in tests', async () => {
  const code = [
    "const { $, $$, browser } = require('@wdio/globals');",
    "it('x', async function () {",
    "  await $('~Add').click();",
    "  await $$('~Cell').length;",
    "  await browser.$('~Done').click();",
    '});',
    ''
  ].join('\n');
  const messages = await messagesFor(code, 'tests/raw-selector.test.js');
  assert.equal(messages.filter((m) => m === MESSAGE).length, 3);
});

test('screen objects may use selectors', async () => {
  const code = "const { $ } = require('@wdio/globals');\nmodule.exports = () => $('~Add');\n";
  const messages = await messagesFor(code, 'screens/Example.js');
  assert.ok(!messages.includes(MESSAGE));
});

test('the shipped tests pass the rule', async () => {
  const eslint = new ESLint({ cwd: root });
  const results = await eslint.lintFiles(['tests/**/*.test.js']);
  const hits = results.flatMap((r) => r.messages).filter((m) => m.message === MESSAGE);
  assert.deepEqual(hits, []);
});
