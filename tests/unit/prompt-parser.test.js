const assert = require('node:assert/strict');
const test = require('node:test');

const { parsePrompt, parseStepsFromBody, parseMcpTools, validatePrompt } = require('../../src/prompt-parser');

test('parsePrompt keeps automation steps separate from MCP tools', () => {
  const prompt = parsePrompt('prompts/reminders-app.md');

  assert.equal(prompt.steps.length, 5);
  assert.deepEqual(prompt.mcpTools, [
    'appium_session_management',
    'appium_find_element',
    'appium_gesture',
    'appium_set_value',
    'appium_get_page_source',
    'appium_generate_tests'
  ]);
});

test('parsePrompt captures entry and exit point presence', () => {
  const prompt = parsePrompt('prompts/contacts-app.md');

  assert.equal(prompt.hasEntryPoint, true);
  assert.equal(prompt.hasExitPoint, true);
});

test('validatePrompt returns actionable errors for incomplete prompts', () => {
  const errors = validatePrompt({
    title: '',
    app: '',
    steps: [],
    mcpTools: [],
    hasEntryPoint: false,
    hasExitPoint: false
  });

  assert.deepEqual(errors, [
    'Missing required frontmatter field: title',
    'Missing required frontmatter field: app',
    'Prompt must include at least one numbered step',
    'Prompt must list at least one Appium MCP tool',
    'Prompt must include an Entry Point section',
    'Prompt must include an Exit Point section'
  ]);
});

test('parseStepsFromBody stops at the MCP tools section', () => {
  const body = [
    '## Steps:',
    '',
    '1. Tap "Add"',
    '2. Wait 2 seconds',
    '',
    '## MCP Tools to use:',
    '',
    '- appium_find_element (accessibility id strategy)',
    '- appium_gesture (action=tap)'
  ].join('\n');

  assert.deepEqual(parseStepsFromBody(body), [
    'Tap "Add"',
    'Wait 2 seconds'
  ]);
});

test('parseMcpTools normalizes canonical Appium MCP tool names', () => {
  const body = [
    '## MCP Tools to use:',
    '',
    '- appium_find_element (accessibility id strategy)',
    '- Use `appium_gesture` for taps',
    '- appium_find_element (duplicate)'
  ].join('\n');

  assert.deepEqual(parseMcpTools(body), [
    'appium_find_element',
    'appium_gesture'
  ]);
});
