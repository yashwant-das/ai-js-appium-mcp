const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');

const { generateStepCode, generateTest, getOutputPath } = require('../../src/test-generator');

test('getOutputPath derives generated filename from prompt filename', () => {
  const prompt = {
    title: 'Create Reminder',
    sourcePath: path.resolve('prompts/reminders-app.md')
  };

  assert.equal(getOutputPath(prompt), path.join('tests', 'reminders-app.test.js'));
});

test('wait step parses seconds as milliseconds', () => {
  const code = generateStepCode('Wait 2 seconds for the form to appear', 1);

  assert.match(code, /browser\.pause\(2000\)/);
  assert.doesNotMatch(code, /1000000/);
});

test('wait step parses second ranges using the upper bound', () => {
  const code = generateStepCode('Wait 3-5 seconds for results to load', 1);

  assert.match(code, /browser\.pause\(5000\)/);
});

test('ambiguous enter step remains an agent instruction instead of inventing selector', () => {
  const code = generateStepCode('Enter the title "Test reminder from Appium" in the title field', 1);

  assert.match(code, /TODO\(Appium MCP\)/);
  assert.doesNotMatch(code, /\$\(\'~the title field\'\)/);
});

test('verify step uses Chai against a boolean displayed state', () => {
  const code = generateStepCode('Verify "Done" is displayed', 1);

  assert.match(code, /isDisplayed\(\)/);
  assert.match(code, /expect\(.*Displayed\)\.to\.equal\(true\)/s);
  assert.doesNotMatch(code, /to\.beDisplayed/);
});

test('generateTest emits debug artifacts on failure', () => {
  const code = generateTest({
    title: 'Create Reminder',
    steps: ['Tap "Done"'],
    mcpTools: ['appium_gesture'],
    sourcePath: path.resolve('prompts/reminders-app.md')
  });

  assert.match(code, /fs\.mkdirSync\('\.\/test-results'/);
  assert.match(code, /browser\.getPageSource\(\)/);
  assert.match(code, /browser\.saveScreenshot\('\.\/test-results\/debug\.png'\)/);
  assert.match(code, /throw error/);
});
