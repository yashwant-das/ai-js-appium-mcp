const test = require('node:test');
const assert = require('node:assert/strict');
const { registerCleanup, runCleanups } = require('../support/cleanup');

test('runs cleanups in reverse order and empties the queue', async () => {
  const calls = [];
  registerCleanup('first', () => calls.push('first'));
  registerCleanup('second', async () => calls.push('second'));

  assert.deepEqual(await runCleanups(), []);
  assert.deepEqual(calls, ['second', 'first']);
  assert.deepEqual(await runCleanups(), []);
  assert.deepEqual(calls, ['second', 'first']);
});

test('a failing cleanup is reported and the rest still run', async () => {
  const calls = [];
  registerCleanup('ok', () => calls.push('ok'));
  registerCleanup('boom', () => {
    throw new Error('boom');
  });

  const failures = await runCleanups();
  assert.deepEqual(calls, ['ok']);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].name, 'boom');
  assert.equal(failures[0].error.message, 'boom');
});
