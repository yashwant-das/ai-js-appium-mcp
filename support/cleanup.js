// Tasks registered during a test run in afterTest, newest first.
const tasks = [];

function registerCleanup(name, fn) {
  tasks.push({ name, fn });
}

async function runCleanups() {
  const failures = [];
  while (tasks.length > 0) {
    const { name, fn } = tasks.pop();
    try {
      await fn();
    } catch (error) {
      failures.push({ name, error });
    }
  }
  return failures;
}

module.exports = { registerCleanup, runCleanups };
