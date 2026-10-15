// One runId per worker process, so names from different runs never collide.
const runId = Date.now().toString(36);
let counter = 0;

function uniqueContact(overrides = {}) {
  counter += 1;
  const suffix = `${runId}${counter}`;
  const first = overrides.first ?? 'John';
  const last = overrides.last ?? `Doe-${suffix}`;

  return {
    first,
    last,
    phone: overrides.phone ?? `98${String(Date.now() + counter).slice(-8)}`,
    email: overrides.email ?? `john.doe.${suffix}@example.com`,
    fullName: `${first} ${last}`
  };
}

module.exports = { runId, uniqueContact };
