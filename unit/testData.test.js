const test = require('node:test');
const assert = require('node:assert/strict');
const { runId, uniqueContact } = require('../support/testData');

test('runId is a short base-36 string', () => {
  assert.match(runId, /^[0-9a-z]{6,10}$/);
});

test('each contact is unique within a run', () => {
  const a = uniqueContact();
  const b = uniqueContact();
  assert.notEqual(a.last, b.last);
  assert.notEqual(a.phone, b.phone);
  assert.notEqual(a.email, b.email);
});

test('contacts are readable and searchable', () => {
  const c = uniqueContact();
  assert.equal(c.first, 'John');
  assert.match(c.last, new RegExp(`^Doe-${runId}\\d+$`));
  assert.equal(c.fullName, `${c.first} ${c.last}`);
  assert.match(c.phone, /^\d{10}$/);
  assert.match(c.email, /^john\.doe\.[0-9a-z]+@example\.com$/);
});

test('overrides win and fullName follows them', () => {
  const c = uniqueContact({ first: 'Jane', phone: '5550001111' });
  assert.equal(c.first, 'Jane');
  assert.equal(c.phone, '5550001111');
  assert.equal(c.fullName, `Jane ${c.last}`);
});
