const fs = require('node:fs');
const path = require('node:path');
const { browser } = require('@wdio/globals');
const allure = require('@wdio/allure-reporter');
const { runCleanups } = require('./cleanup');
const { resetToHome } = require('./appState');

async function saveFailureArtifacts(test) {
  const dir = path.join(process.cwd(), 'test-results', 'failures');
  fs.mkdirSync(dir, { recursive: true });
  const base = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;

  const screenshotPath = path.join(dir, `${base}.png`);
  const screenshot = await browser.saveScreenshot(screenshotPath);
  await allure.addAttachment('Failure screenshot', screenshot, 'image/png');

  try {
    const source = await browser.getPageSource();
    fs.writeFileSync(path.join(dir, `${base}.xml`), source);
    await allure.addAttachment('Page source', source, 'application/xml');
  } catch (error) {
    console.error('Failed to capture page source:', error);
  }

  console.log(`\n📸 Failure artifacts saved to ${dir}/${base}.{png,xml}`);
}

async function afterTest(test, _context, { error }) {
  if (error) {
    await saveFailureArtifacts(test);
  }

  const failures = await runCleanups();
  for (const failure of failures) {
    console.warn(`Cleanup "${failure.name}" failed: ${failure.error.message}`);
    await allure.addAttachment(
      `Cleanup failed: ${failure.name}`,
      String(failure.error.stack || failure.error),
      'text/plain'
    );
  }
}

async function beforeTest() {
  await resetToHome();
}

module.exports = { beforeTest, afterTest };
