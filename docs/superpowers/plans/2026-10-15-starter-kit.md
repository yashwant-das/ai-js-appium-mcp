# Starter Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline in one session. **Do not use subagents on this project** (user instruction, 2026-10-15). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ai-js-appium-mcp into a single-app starter kit where `npm test` runs every test with no environment variables on the command line, tests are built on screen objects, test data cleans itself up, and runs produce an Allure report.

**Architecture:** App identity moves into a checked-in `app.config.js` resolved by `support/appConfig.js`; WDIO config splits into a shared file plus thin iOS and Android files. Screen objects in `screens/` own every locator; multi-screen flows live in `screens/flows.js`. `support/` holds pure helpers (test data, cleanup queue, app-config resolution — unit-tested with `node:test`) and device helpers (gestures, app state, WDIO hooks).

**Tech Stack:** Node 24, WebdriverIO 10 (Mocha), Appium 3 with XCUITest 12 and UiAutomator2 8 drivers, Allure 3, ESLint 10, `node:test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-10-15-starter-kit-design.md`

## Global Constraints

- Single app per project; the demo app is iOS Contacts, `com.apple.MobileAddressBook`.
- CommonJS JavaScript only. No TypeScript.
- Dependency floors (caret ranges): `@wdio/cli`, `@wdio/local-runner`, `@wdio/globals` ^10.0.2; `@wdio/mocha-framework`, `@wdio/spec-reporter`, `@wdio/allure-reporter` ^10.0.1; `allure` ^3.20.1; `appium` ^3.8.0; `appium-xcuitest-driver` ^12.18.1; `appium-uiautomator2-driver` ^8.7.0; `chai` ^6.3.0; `dotenv` ^18.0.8; `eslint` ^10.12.0; `@eslint/js` ^10.0.1; `eslint-plugin-wdio` ^10.0.1; `eslint-plugin-chai-friendly` ^1.2.1; `globals` ^17.13.0; `husky` ^9.1.7; `lint-staged` ^17.6.0.
- `engines.node` is `">=24"`; `.nvmrc` contains `24`.
- `appium:noReset` is always `true`; the `beforeTest` hook restarts the app instead.
- Screens hold locators and actions only; all assertions live in tests. Tests contain no raw selectors (`$`, `$$`, `driver.$`, `browser.$` …), enforced by lint with the message `Use a screen object method instead of a raw selector.`
- Locator priority: accessibility ID → iOS predicate / class chain or Android resource ID → XPath last.
- Cleanup never fails a test; failures are logged and attached to Allure.
- Test names use `uniqueContact()`; no fixed names such as plain "John Doe".
- No subagents at any point.

## Prerequisites for device steps

Steps marked **[device]** need: the iOS 27 simulator from `.env` booted, Appium running (`npm run appium` in a second terminal once Task 1 is done), and the Contacts app installed (it is a system app). Use Appium MCP or `driver.getPageSource()` output in `test-results/failures/*.xml` to inspect the UI.

## Review Focus

1. **App restored into a non-list screen.** iOS state restoration can reopen the New Contact sheet, an Edit form or a contact card after `terminateApp`/`activateApp`. Expected: `beforeTest` always lands on the contacts list. Covered by Task 6 Step 9 (start a test with the Edit form left open).
2. **Contact not found during cleanup** (test already deleted it, or creation failed before saving). Expected: cleanup returns quietly. Covered by the `delete-contact` test (Task 8) and Task 6 Step 9.
3. **Phone number displayed formatted** (`(987) 654-3210` instead of `9876543210`). Expected: assertions compare digits only. Covered by `ContactDetailScreen.phoneDigits()` and the edit test (Task 8).
4. **Element below the fold** (Add Phone / Add Email / Delete Contact off-screen on smaller simulators). Expected: actions scroll before tapping. Covered by `BaseScreen.scrollTo` used in `NewContactScreen.fill` and `EditContactScreen.deleteContact`, and Task 10 Step 4 on a smaller device if available.
5. **Leftover search text from a previous run.** Expected: `resetToHome` clears search so list assertions are not filtered. Covered by Task 6 Step 9.

---

## File map

| Path | Responsibility | Task |
| --- | --- | --- |
| `package.json`, `.nvmrc`, `.github/workflows/lint.yml` | dependencies, scripts, Node baseline, CI | 1, 3, 7 |
| `app.config.js` | app identity | 2 |
| `support/appConfig.js` | resolve app identity per platform with env overrides | 2 |
| `unit/*.test.js` | `node:test` unit tests for pure modules and lint rule | 2, 4, 7 |
| `config/wdio.shared.conf.js`, `config/wdio.ios.conf.js`, `config/wdio.android.conf.js` | WDIO configuration | 3, 5 |
| `.env.example`, `.gitignore` | machine settings, ignored output | 3, 5 |
| `support/testData.js` | unique contact data | 4 |
| `support/cleanup.js` | cleanup queue | 4 |
| `support/gestures.js` | `tapIfVisible`, `scrollTo` | 5 |
| `support/appState.js` | `restartApp`, `dismissLeftovers`, `resetToHome` | 6 |
| `support/hooks.js` | `beforeTest`, `afterTest` | 5, 6 |
| `screens/BaseScreen.js` + 4 Contacts screens | locators and actions | 6 |
| `screens/flows.js` | `createContact`, `deleteContactByName` | 6 |
| `tests/*.test.js` | 4 demo tests | 6, 8 |
| `eslint.config.js` | lint rules incl. raw-selector ban | 7 |
| `prompts/*.md` | scenarios | 8 |
| `AGENTS.md`, `README.md`, `docs/*` | documentation | 9 |

Deviations from the spec, decided while planning (recorded in the spec in Task 9): `registerCleanup`/`runCleanups` live in `support/cleanup.js` and `deleteContactByName` in `screens/flows.js` (keeps `testData.js` pure and unit-testable); app-specific leftover handling lives in `support/appState.js` (both hooks and cleanup need it; avoids a hooks ↔ flows cycle); unit tests under `unit/` run with `node --test`; Allure's automatic WebDriver screenshots are disabled (`disableWebdriverScreenshotsReporting: true`) because failure screenshots are attached explicitly; `test-results/` was never tracked, so nothing needs untracking; `.env` variables are renamed per platform (`IOS_*`, `ANDROID_*`).

---

### Task 1: Dependency and Node baseline

**Files:**
- Modify: `package.json`
- Create: `.nvmrc`
- Modify: `.github/workflows/lint.yml`
- Delete: `tests/create-contact.test copy.js` (untracked, byte-identical to `tests/create-contact.test.js`; it makes every run execute the test twice)

**Interfaces:**
- Produces: `npm run appium` starts the project-local Appium with project-pinned drivers.

- [ ] **Step 1: Confirm the stray copy is identical, then delete it**

```bash
cmp tests/create-contact.test.js "tests/create-contact.test copy.js" && rm "tests/create-contact.test copy.js"
```
Expected: no output from `cmp`; file removed. If `cmp` reports a difference, stop and ask the user.

- [ ] **Step 2: Install new dependencies**

```bash
npm install -D @wdio/globals@^10.0.2 @wdio/allure-reporter@^10.0.1 allure@^3.20.1 appium@^3.8.0 appium-xcuitest-driver@^12.18.1 appium-uiautomator2-driver@^8.7.0
```

- [ ] **Step 3: Bump existing dependencies**

```bash
npm install -D chai@^6.3.0 dotenv@^18.0.8 eslint@^10.12.0 globals@^17.13.0 lint-staged@^17.6.0
```
Expected: both installs succeed. If npm reports blocked install scripts for an Appium package, list them and check whether the driver still loads in Step 5 before allowing any script in `allowScripts`.

- [ ] **Step 4: Set Node baseline and scripts**

In `package.json` add after `"license"`:

```json
  "engines": {
    "node": ">=24"
  },
```

and add to `"scripts"`:

```json
    "appium": "appium",
```

Create `.nvmrc`:

```text
24
```

In `.github/workflows/lint.yml` change `node-version: 22` to `node-version: 24`.

- [ ] **Step 5: Verify the project-local Appium sees both drivers**

Run: `npx appium driver list --installed`
Expected: lists `xcuitest@12.18.1` (or newer 12.x) and `uiautomator2@8.7.0` (or newer 8.x). If only the global xcuitest appears, run `APPIUM_HOME=$PWD npx appium driver list --installed`; if that works, change the script to `"appium": "APPIUM_HOME=$PWD appium"` and re-run Step 5.

- [ ] **Step 6: Verify lint still passes**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .nvmrc .github/workflows/lint.yml
git commit -m "Pin latest Appium, drivers, Allure and tooling; require Node 24"
```

---

### Task 2: App identity and unit-test harness

**Files:**
- Create: `app.config.js`
- Create: `support/appConfig.js`
- Create: `unit/appConfig.test.js`
- Modify: `package.json` (script `test:unit`)

**Interfaces:**
- Produces: `resolveApp(platform: 'ios'|'android', env = process.env, config = require('../app.config')) → { platform, appId, bundleId? , appPackage?, appActivity? }`. Throws `No iOS app configured: set ios.bundleId in app.config.js`, `No Android app configured: set android.appPackage in app.config.js`, or `Unknown platform "<p>": expected "ios" or "android"`.

- [ ] **Step 1: Add the unit-test script**

In `package.json` `"scripts"` add:

```json
    "test:unit": "node --test \"unit/**/*.test.js\"",
```

- [ ] **Step 2: Write the failing test**

Create `unit/appConfig.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveApp } = require('../support/appConfig');

const config = {
  ios: { bundleId: 'com.example.ios' },
  android: { appPackage: 'com.example.android', appActivity: '.MainActivity' }
};

test('resolves the iOS bundle ID from app.config.js', () => {
  assert.deepEqual(resolveApp('ios', {}, config), {
    platform: 'ios',
    appId: 'com.example.ios',
    bundleId: 'com.example.ios'
  });
});

test('APP_BUNDLE_ID overrides the iOS bundle ID', () => {
  assert.equal(resolveApp('ios', { APP_BUNDLE_ID: 'com.override' }, config).appId, 'com.override');
});

test('resolves Android package and activity, with env overrides', () => {
  assert.deepEqual(resolveApp('Android', { APP_ACTIVITY: '.Other' }, config), {
    platform: 'android',
    appId: 'com.example.android',
    appPackage: 'com.example.android',
    appActivity: '.Other'
  });
});

test('throws a clear error when the Android app is not configured', () => {
  assert.throws(
    () => resolveApp('android', {}, { android: { appPackage: '' } }),
    /No Android app configured: set android\.appPackage in app\.config\.js/
  );
});

test('throws a clear error when the iOS app is not configured', () => {
  assert.throws(() => resolveApp('ios', {}, {}), /No iOS app configured: set ios\.bundleId in app\.config\.js/);
});

test('rejects unknown platforms', () => {
  assert.throws(() => resolveApp('web', {}, config), /Unknown platform "web"/);
});

test('the shipped app.config.js targets iOS Contacts', () => {
  assert.equal(resolveApp('ios', {}).appId, 'com.apple.MobileAddressBook');
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm run test:unit`
Expected: FAIL with `Cannot find module '../support/appConfig'`.

- [ ] **Step 4: Implement**

Create `app.config.js`:

```js
// The app under test. Edit this file when adopting the kit for your own app.
// Any value can be overridden with APP_BUNDLE_ID, APP_PACKAGE or APP_ACTIVITY.
module.exports = {
  name: 'Contacts',
  ios: {
    bundleId: 'com.apple.MobileAddressBook'
  },
  android: {
    appPackage: '',
    appActivity: ''
  }
};
```

Create `support/appConfig.js`:

```js
const appConfig = require('../app.config');

function resolveApp(platform, env = process.env, config = appConfig) {
  const name = String(platform).toLowerCase();

  if (name === 'ios') {
    const bundleId = env.APP_BUNDLE_ID || config.ios?.bundleId;
    if (!bundleId) {
      throw new Error('No iOS app configured: set ios.bundleId in app.config.js');
    }
    return { platform: 'ios', appId: bundleId, bundleId };
  }

  if (name === 'android') {
    const appPackage = env.APP_PACKAGE || config.android?.appPackage;
    const appActivity = env.APP_ACTIVITY || config.android?.appActivity;
    if (!appPackage) {
      throw new Error('No Android app configured: set android.appPackage in app.config.js');
    }
    return { platform: 'android', appId: appPackage, appPackage, appActivity };
  }

  throw new Error(`Unknown platform "${platform}": expected "ios" or "android"`);
}

module.exports = { resolveApp };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit`
Expected: 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app.config.js support/appConfig.js unit/appConfig.test.js package.json
git commit -m "Add app.config.js and a resolver with env overrides"
```

---

### Task 3: Split the WDIO configuration

**Files:**
- Create: `config/wdio.shared.conf.js`, `config/wdio.ios.conf.js`, `config/wdio.android.conf.js`
- Delete: `wdio.conf.js`
- Modify: `package.json` scripts, `.env.example`, local `.env` (not committed)

**Interfaces:**
- Consumes: `resolveApp` (Task 2).
- Produces: `exports.config` in each config file; `npm test`, `npm run test:ios`, `npm run test:android`, `npm run verify`.

- [ ] **Step 1: Create the shared config**

Create `config/wdio.shared.conf.js` (hooks are added in Task 5):

```js
require('dotenv').config({ quiet: true });

exports.config = {
  runner: 'local',
  specs: ['../tests/**/*.test.js'],
  maxInstances: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: process.env.WDIO_RETRIES ? Number(process.env.WDIO_RETRIES) : 1
  },

  reporters: ['spec'],

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_PATH || '/',

  logLevel: process.env.WDIO_LOG_LEVEL || 'warn',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 0
};
```

Mocha timeout rises from 60 s to 120 s because cleanup now runs inside `afterTest`, which counts toward the test's time budget.

- [ ] **Step 2: Create the platform configs**

Create `config/wdio.ios.conf.js`:

```js
const { config: shared } = require('./wdio.shared.conf');
const { resolveApp } = require('../support/appConfig');

const app = resolveApp('ios');

const capability = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone Simulator',
  'appium:platformVersion': process.env.IOS_PLATFORM_VERSION,
  'appium:udid': process.env.IOS_UDID,
  'appium:bundleId': app.bundleId,
  'appium:noReset': true
};

exports.config = {
  ...shared,
  capabilities: [
    Object.fromEntries(Object.entries(capability).filter(([, value]) => value))
  ]
};
```

Create `config/wdio.android.conf.js`:

```js
const { config: shared } = require('./wdio.shared.conf');
const { resolveApp } = require('../support/appConfig');

const app = resolveApp('android');

const capability = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION,
  'appium:udid': process.env.ANDROID_UDID,
  'appium:appPackage': app.appPackage,
  'appium:appActivity': app.appActivity,
  'appium:noReset': true
};

exports.config = {
  ...shared,
  capabilities: [
    Object.fromEntries(Object.entries(capability).filter(([, value]) => value))
  ]
};
```

- [ ] **Step 3: Replace scripts and remove the old config**

In `package.json` replace the `"verify"`, `"test"` and `"clean"` scripts with:

```json
    "test": "wdio run config/wdio.ios.conf.js",
    "test:ios": "wdio run config/wdio.ios.conf.js",
    "test:android": "wdio run config/wdio.android.conf.js",
    "verify": "wdio run config/wdio.ios.conf.js",
    "clean": "rm -rf test-results allure-results allure-report",
```

(`verify` repeats the command instead of calling `npm test`, because `npm run verify -- --spec x` would otherwise pass `--spec` to npm.)

```bash
git rm wdio.conf.js
```

- [ ] **Step 4: Rewrite `.env.example`**

```dotenv
# Machine-specific settings. The app under test lives in app.config.js.

# ======================================
# Appium Server
# ======================================
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_PATH=/

# ======================================
# iOS device (npm test / npm run test:ios)
# Leave IOS_UDID empty to let Appium pick a simulator by name and version.
# ======================================
IOS_DEVICE_NAME=iPhone 18 Pro
IOS_PLATFORM_VERSION=27.0
IOS_UDID=

# ======================================
# Android device (npm run test:android)
# ======================================
ANDROID_DEVICE_NAME=Android Emulator
ANDROID_PLATFORM_VERSION=
ANDROID_UDID=

# ======================================
# WebdriverIO
# appium:noReset is always true: each test restarts the app in beforeTest,
# so state from earlier runs or Appium MCP sessions does not leak in.
# ======================================
WDIO_LOG_LEVEL=warn
# Retries per failing test. Set to 0 when checking a test is stable.
WDIO_RETRIES=1
```

- [ ] **Step 5: Migrate the local `.env`**

Read `.env`. Rename `APPIUM_DEVICE_NAME` → `IOS_DEVICE_NAME`, `APPIUM_PLATFORM_VERSION` → `IOS_PLATFORM_VERSION`, `APPIUM_UDID` → `IOS_UDID`, keeping their values. Remove `APPIUM_PLATFORM`, `APPIUM_AUTOMATION_NAME`, `APPIUM_BUNDLE_ID`, `APPIUM_APP_PACKAGE`, `APPIUM_APP_ACTIVITY`, `APPIUM_NO_RESET`. Keep everything else. `.env` is git-ignored; do not commit it.

- [ ] **Step 6: Verify Android fails clearly**

Run: `npm run test:android`
Expected: non-zero exit, output contains `No Android app configured: set android.appPackage in app.config.js`.

- [ ] **Step 7: [device] Verify the iOS config runs the existing test without env vars on the command line**

The existing test body still reads `process.env.APPIUM_BUNDLE_ID` in its own `beforeEach`, so pass that variable for this one check only:

```bash
APPIUM_BUNDLE_ID=com.apple.MobileAddressBook WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js
```
Expected: 1 passing. (This variable is only for the old test body, which Task 6 replaces. The session itself now gets the app from `app.config.js`.)

- [ ] **Step 8: Commit**

```bash
git add config package.json .env.example
git commit -m "Split WDIO config into shared, iOS and Android files"
```

---

### Task 4: Test data and cleanup queue

**Files:**
- Create: `support/testData.js`, `support/cleanup.js`
- Create: `unit/testData.test.js`, `unit/cleanup.test.js`

**Interfaces:**
- Produces: `runId: string`; `uniqueContact(overrides?: {first?, last?, phone?, email?}) → { first, last, phone, email, fullName }`; `registerCleanup(name: string, fn: () => Promise<unknown>|unknown) → void`; `runCleanups() → Promise<Array<{ name: string, error: Error }>>` (runs in reverse registration order, empties the queue, never throws).

- [ ] **Step 1: Write the failing tests**

Create `unit/testData.test.js`:

```js
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
```

Create `unit/cleanup.test.js`:

```js
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
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:unit`
Expected: FAIL with `Cannot find module '../support/testData'` and `'../support/cleanup'`.

- [ ] **Step 3: Implement**

Create `support/testData.js`:

```js
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
```

Create `support/cleanup.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit`
Expected: all unit tests pass (7 + 4 + 2 = 13).

- [ ] **Step 5: Commit**

```bash
git add support/testData.js support/cleanup.js unit/testData.test.js unit/cleanup.test.js
git commit -m "Add unique test data and a cleanup queue"
```

---

### Task 5: Gestures, failure artifacts and Allure

**Files:**
- Create: `support/gestures.js`, `support/hooks.js`
- Modify: `config/wdio.shared.conf.js`, `package.json` (script `report`), `.gitignore`

**Interfaces:**
- Consumes: `runCleanups` (Task 4).
- Produces: `tapIfVisible(element, timeout = 3000) → Promise<boolean>`; `scrollTo(element, maxScrolls = 5) → Promise<void>`; `afterTest(test, context, result)` (failure artifacts + cleanups); `beforeTest` is added in Task 6.

- [ ] **Step 1: Create the gesture helpers**

Create `support/gestures.js`:

```js
// Taps the element if it shows up within `timeout`. Never throws.
async function tapIfVisible(element, timeout = 3000) {
  const visible = await element.waitForDisplayed({ timeout }).then(
    () => true,
    () => false
  );
  if (visible) {
    await element.click();
  }
  return visible;
}

// Swipes until the element is on screen (WebdriverIO's native-app scrollIntoView).
async function scrollTo(element, maxScrolls = 5) {
  if (await element.isDisplayed().catch(() => false)) {
    return;
  }
  await element.scrollIntoView({ maxScrolls });
}

module.exports = { tapIfVisible, scrollTo };
```

- [ ] **Step 2: Create the hooks module with `afterTest`**

Create `support/hooks.js`:

```js
const fs = require('node:fs');
const path = require('node:path');
const { browser } = require('@wdio/globals');
const allure = require('@wdio/allure-reporter');
const { runCleanups } = require('./cleanup');

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

module.exports = { afterTest };
```

- [ ] **Step 3: Wire Allure and the hook into the shared config**

In `config/wdio.shared.conf.js` replace `reporters: ['spec'],` with:

```js
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true
      }
    ]
  ],
```

and replace the last property `connectionRetryCount: 0` with the lines below. The lazy `require` keeps device modules out of the launcher process.

```js
  connectionRetryCount: 0,

  afterTest: (...args) => require('../support/hooks').afterTest(...args)
```

- [ ] **Step 4: Add the report script and ignore generated output**

In `package.json` `"scripts"` add:

```json
    "report": "allure generate allure-results --open",
```

In `.gitignore`, under `# Test artifacts`, add `allure-results/` and `allure-report/`, and delete the two lines `# tests/*.test.js` and `!tests/helpers/`.

- [ ] **Step 5: [device] Verify a failure produces artifacts in both places**

Temporarily change `$('~Add')` in `tests/create-contact.test.js` to `$('~AddBroken')`, then:

```bash
npm run clean
APPIUM_BUNDLE_ID=com.apple.MobileAddressBook WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js
ls test-results/failures
npx allure generate allure-results -o allure-report
```
Expected: 1 failing; `test-results/failures/` has one `.png` and one `.xml`; generation succeeds. Open `allure-report/index.html` (or `npm run report`) and confirm the failed test shows "Failure screenshot" and "Page source" attachments. Then restore `$('~Add')` with `git checkout tests/create-contact.test.js`.

- [ ] **Step 6: Commit**

```bash
git add support/gestures.js support/hooks.js config/wdio.shared.conf.js package.json .gitignore
git commit -m "Attach failure screenshots and page source to an Allure report"
```

---

### Task 6: Screen objects, app reset and the create-contact test

**Files:**
- Create: `screens/BaseScreen.js`, `screens/ContactsListScreen.js`, `screens/NewContactScreen.js`, `screens/ContactDetailScreen.js`, `screens/EditContactScreen.js`, `screens/flows.js`, `support/appState.js`
- Modify: `support/hooks.js` (add `beforeTest`), `config/wdio.shared.conf.js` (wire `beforeTest`)
- Rewrite: `tests/create-contact.test.js`
- Delete: `tests/helpers/.gitkeep`

**Interfaces:**
- Consumes: `tapIfVisible`, `scrollTo` (Task 5); `resolveApp` (Task 2); `uniqueContact` (Task 4); `registerCleanup` (Task 4).
- Produces:
  - `BaseScreen`: `name`, `rootSelector` (getter), `sel(locators: {ios?, android?}, label: string) → string`, `el(locators, label) → element`, `waitForDisplayed(timeout = 10000)`, `isDisplayed() → Promise<boolean>`, `tap(element, timeout = 10000)`, `type(element, text, timeout = 10000)`, `tapIfVisible(element, timeout?)`, `scrollTo(element)`.
  - `ContactsListScreen`: `tapAdd()`, `search(text)`, `clearSearch()`, `openContact(fullName)`, `waitForContactCount(fullName, expected, timeout = 5000) → Promise<number>`.
  - `NewContactScreen`: `fill({ first, last, phone?, email? })`, `save()`, `cancelAndDiscard()`.
  - `ContactDetailScreen`: `headerName() → Promise<string>`, `phoneDigits() → Promise<string>`, `tapEdit()`, `goBack()`.
  - `EditContactScreen`: `setPhone(phone)`, `save()`, `cancelAndDiscard()`, `deleteContact()`.
  - `flows`: `createContact(contact)` (ends on the contact card), `deleteContactByName(fullName) → Promise<boolean>`.
  - `appState`: `restartApp()`, `dismissLeftovers()`, `resetToHome()`.
  - `hooks.beforeTest()`.

- [ ] **Step 1: Create `BaseScreen`**

Create `screens/BaseScreen.js`:

```js
const { $, driver } = require('@wdio/globals');
const gestures = require('../support/gestures');

class BaseScreen {
  get name() {
    return this.constructor.name;
  }

  // Selector of an element that proves this screen is showing. Override it.
  get rootSelector() {
    throw new Error(`${this.name} must define rootSelector`);
  }

  // Picks the locator for the platform under test.
  sel(locators, label) {
    const platform = driver.isIOS ? 'ios' : 'android';
    const selector = locators[platform];
    if (!selector) {
      throw new Error(`${this.name}.${label} has no ${platform} locator`);
    }
    return selector;
  }

  el(locators, label) {
    return $(this.sel(locators, label));
  }

  async waitForDisplayed(timeout = 10000) {
    await $(this.rootSelector).waitForDisplayed({ timeout });
  }

  async isDisplayed() {
    return $(this.rootSelector)
      .isDisplayed()
      .catch(() => false);
  }

  async tap(element, timeout = 10000) {
    await element.waitForDisplayed({ timeout });
    await element.click();
  }

  async type(element, text, timeout = 10000) {
    await element.waitForDisplayed({ timeout });
    await element.clearValue();
    await element.addValue(text);
  }

  tapIfVisible(element, timeout) {
    return gestures.tapIfVisible(element, timeout);
  }

  scrollTo(element) {
    return gestures.scrollTo(element);
  }
}

module.exports = BaseScreen;
```

- [ ] **Step 2: Create the Contacts screens**

Locators marked `// verify` were not used by the current test; Step 3 confirms them on the device.

Create `screens/ContactsListScreen.js`:

```js
const { $$, browser } = require('@wdio/globals');
const BaseScreen = require('./BaseScreen');

const quote = (text) => text.replace(/'/g, "\\'");

class ContactsListScreen extends BaseScreen {
  get rootSelector() {
    return this.sel({ ios: '~Add' }, 'root');
  }

  get addButton() {
    return this.el({ ios: '~Add' }, 'addButton');
  }

  get searchField() {
    return this.el({ ios: '-ios class chain:**/XCUIElementTypeSearchField' }, 'searchField'); // verify
  }

  get cancelSearchButton() {
    return this.el({ ios: '~Cancel' }, 'cancelSearchButton'); // verify
  }

  contactCellSelector(fullName) {
    return this.sel(
      { ios: `-ios predicate string:type == 'XCUIElementTypeCell' AND name == '${quote(fullName)}'` },
      'contactCell'
    );
  }

  async tapAdd() {
    await this.tap(this.addButton);
  }

  async search(text) {
    await this.tap(this.searchField);
    await this.type(this.searchField, text);
  }

  async clearSearch() {
    await this.tapIfVisible(this.cancelSearchButton, 1000);
  }

  async openContact(fullName) {
    const cells = $$(this.contactCellSelector(fullName));
    await browser.waitUntil(async () => (await cells.length) > 0, {
      timeout: 10000,
      timeoutMsg: `No contact cell named "${fullName}"`
    });
    await cells[0].click();
  }

  // Waits until `expected` cells match, then returns the count seen last.
  async waitForContactCount(fullName, expected, timeout = 5000) {
    const selector = this.contactCellSelector(fullName);
    let count = -1;
    await browser
      .waitUntil(
        async () => {
          count = await $$(selector).length;
          return count === expected;
        },
        { timeout, interval: 500 }
      )
      .catch(() => {});
    return count;
  }
}

module.exports = new ContactsListScreen();
```

Create `screens/NewContactScreen.js`:

```js
const BaseScreen = require('./BaseScreen');

class NewContactScreen extends BaseScreen {
  get rootSelector() {
    return this.sel(
      { ios: "-ios predicate string:type == 'XCUIElementTypeNavigationBar' AND name == 'New Contact'" },
      'root'
    );
  }

  get firstName() {
    return this.el({ ios: '~First name' }, 'firstName');
  }

  get lastName() {
    return this.el({ ios: '~Last name' }, 'lastName');
  }

  get addPhoneButton() {
    return this.el({ ios: '~Insert add phone' }, 'addPhoneButton');
  }

  get phoneField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'" },
      'phoneField'
    );
  }

  get addEmailButton() {
    return this.el({ ios: '~Insert add email' }, 'addEmailButton');
  }

  get emailField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'home'" },
      'emailField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done' }, 'doneButton');
  }

  get closeButton() {
    return this.el({ ios: '~close' }, 'closeButton');
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes' }, 'discardButton');
  }

  async fill({ first, last, phone, email }) {
    await this.waitForDisplayed();
    await this.type(this.firstName, first);
    await this.type(this.lastName, last);
    if (phone) {
      await this.scrollTo(this.addPhoneButton);
      await this.tap(this.addPhoneButton);
      await this.type(this.phoneField, phone);
    }
    if (email) {
      await this.scrollTo(this.addEmailButton);
      await this.tap(this.addEmailButton);
      await this.type(this.emailField, email);
    }
  }

  async save() {
    await this.doneButton.waitForEnabled({ timeout: 10000 });
    await this.doneButton.click();
  }

  async cancelAndDiscard() {
    await this.tap(this.closeButton);
    await this.tapIfVisible(this.discardButton, 3000);
  }
}

module.exports = new NewContactScreen();
```

Create `screens/ContactDetailScreen.js`:

```js
const BaseScreen = require('./BaseScreen');

class ContactDetailScreen extends BaseScreen {
  get rootSelector() {
    return this.sel({ ios: '~ContactCardHeaderView' }, 'root');
  }

  get header() {
    return this.el({ ios: '~ContactCardHeaderView' }, 'header');
  }

  get phoneRow() {
    // verify: the row whose label starts with the phone label, e.g. "mobile, (987) 654-3210"
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeCell' AND label BEGINSWITH 'mobile'" },
      'phoneRow'
    );
  }

  get editButton() {
    return this.el({ ios: '~Edit' }, 'editButton'); // verify
  }

  get backButton() {
    return this.el({ ios: '~BackButton' }, 'backButton');
  }

  async headerName() {
    await this.header.waitForDisplayed({ timeout: 10000 });
    return this.header.getAttribute('label');
  }

  // Digits only, so formatting such as "(987) 654-3210" does not matter.
  async phoneDigits() {
    await this.phoneRow.waitForDisplayed({ timeout: 10000 });
    return (await this.phoneRow.getAttribute('label')).replace(/\D/g, '');
  }

  async tapEdit() {
    await this.tap(this.editButton);
  }

  async goBack() {
    await this.tap(this.backButton);
  }
}

module.exports = new ContactDetailScreen();
```

Create `screens/EditContactScreen.js`:

```js
const BaseScreen = require('./BaseScreen');

class EditContactScreen extends BaseScreen {
  get rootSelector() {
    // verify: only the edit form has a Delete Contact button in its hierarchy
    return this.sel(
      { ios: "-ios predicate string:type == 'XCUIElementTypeButton' AND name == 'Delete Contact'" },
      'root'
    );
  }

  get phoneField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'" },
      'phoneField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done' }, 'doneButton');
  }

  get cancelButton() {
    return this.el({ ios: '~Cancel' }, 'cancelButton'); // verify
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes' }, 'discardButton');
  }

  get deleteButton() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeButton' AND name == 'Delete Contact'" },
      'deleteButton'
    );
  }

  get confirmDeleteButton() {
    // verify: the confirmation sheet's Delete Contact button
    return this.el(
      { ios: '-ios class chain:**/XCUIElementTypeSheet/**/XCUIElementTypeButton[`name == "Delete Contact"`]' },
      'confirmDeleteButton'
    );
  }

  // isDisplayed() on the root is false while Delete Contact is below the fold,
  // so check existence instead.
  async isDisplayed() {
    return this.deleteButton.isExisting().catch(() => false);
  }

  async setPhone(phone) {
    await this.type(this.phoneField, phone);
  }

  async save() {
    await this.doneButton.waitForEnabled({ timeout: 10000 });
    await this.doneButton.click();
  }

  async cancelAndDiscard() {
    await this.tap(this.cancelButton);
    await this.tapIfVisible(this.discardButton, 3000);
  }

  async deleteContact() {
    await this.scrollTo(this.deleteButton);
    await this.tap(this.deleteButton);
    await this.tap(this.confirmDeleteButton);
  }
}

module.exports = new EditContactScreen();
```

- [ ] **Step 3: [device] Confirm the `// verify` locators**

With Appium running and Contacts open, use Appium MCP (`appium_session_management`, then `appium_get_page_source` / `generate_locators`) on: the contacts list (search field, Cancel while searching), a contact card (Edit button, the phone row's `label`), the edit form (Cancel, Delete Contact), and the delete confirmation. For each locator marked `// verify`, keep it if it matches exactly one element on that screen; otherwise replace it with the stable locator MCP reports, following the locator priority in Global Constraints. If the phone row's label does not start with `mobile`, change the predicate to match the actual label. Remove each `// verify` comment once confirmed. End the MCP session afterwards so it does not hold the device.

- [ ] **Step 4: Create the flows**

Create `screens/flows.js`:

```js
// Multi-screen actions shared by tests and cleanup.
const ContactsListScreen = require('./ContactsListScreen');
const NewContactScreen = require('./NewContactScreen');
const ContactDetailScreen = require('./ContactDetailScreen');
const EditContactScreen = require('./EditContactScreen');

async function createContact(contact) {
  await ContactsListScreen.tapAdd();
  await NewContactScreen.fill(contact);
  await NewContactScreen.save();
  await ContactDetailScreen.waitForDisplayed();
}

// Returns false when no contact has this name (already deleted, or never saved).
async function deleteContactByName(fullName) {
  const { resetToHome } = require('../support/appState');
  await resetToHome();
  await ContactsListScreen.search(fullName);
  if ((await ContactsListScreen.waitForContactCount(fullName, 1, 5000)) < 1) {
    await ContactsListScreen.clearSearch();
    return false;
  }
  await ContactsListScreen.openContact(fullName);
  await ContactDetailScreen.tapEdit();
  await EditContactScreen.deleteContact();
  await ContactsListScreen.clearSearch();
  return true;
}

module.exports = { createContact, deleteContactByName };
```

(`resetToHome` is required inside the function because `support/appState.js` requires the screens; a top-level require would form a cycle.)

- [ ] **Step 5: Create app state handling**

Create `support/appState.js`:

```js
const { $, driver } = require('@wdio/globals');
const { resolveApp } = require('./appConfig');
const { tapIfVisible } = require('./gestures');
const ContactsListScreen = require('../screens/ContactsListScreen');
const NewContactScreen = require('../screens/NewContactScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');

async function restartApp() {
  const { platform, appId } = resolveApp(driver.isIOS ? 'ios' : 'android');
  const args = platform === 'ios' ? { bundleId: appId } : { appId };
  await driver.execute('mobile: terminateApp', args);
  await driver.execute('mobile: activateApp', args);
}

// App-specific. When adopting the kit, replace this with whatever your app can
// be left showing after a restart (onboarding, open forms, pushed screens).
async function dismissLeftovers() {
  await tapIfVisible($('~Continue'), 3000); // keyboard intro on fresh simulators

  // Check the overlays first: the list's Add button can still report as
  // displayed underneath a sheet.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await NewContactScreen.isDisplayed()) {
      await NewContactScreen.cancelAndDiscard();
    } else if (await EditContactScreen.isDisplayed()) {
      await EditContactScreen.cancelAndDiscard();
    } else if (await ContactDetailScreen.isDisplayed()) {
      await ContactDetailScreen.goBack();
    } else {
      break;
    }
  }

  await ContactsListScreen.clearSearch();
}

async function resetToHome() {
  await restartApp();
  await dismissLeftovers();
  await ContactsListScreen.waitForDisplayed();
}

module.exports = { restartApp, dismissLeftovers, resetToHome };
```

- [ ] **Step 6: Add `beforeTest`**

In `support/hooks.js` add after the `require('./cleanup')` line:

```js
const { resetToHome } = require('./appState');
```

add before `module.exports`:

```js
async function beforeTest() {
  await resetToHome();
}
```

and change the export to `module.exports = { beforeTest, afterTest };`.

In `config/wdio.shared.conf.js` add next to `afterTest`:

```js
  beforeTest: (...args) => require('../support/hooks').beforeTest(...args),
```

- [ ] **Step 7: Rewrite the create-contact test**

Replace `tests/create-contact.test.js` with:

```js
const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: create', function () {
  it('creates a contact with a phone number and email', async function () {
    const contact = uniqueContact();
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    expect(await ContactDetailScreen.headerName()).toBe(contact.fullName);

    await ContactDetailScreen.goBack();
    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);
  });
});
```

Delete the placeholder: `git rm tests/helpers/.gitkeep`.

- [ ] **Step 8: [device] Run it twice with no retries**

```bash
WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js
WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js
```
Expected: 1 passing each time, with no `Cleanup ... failed` warnings. Then search Contacts for `Doe-` (Appium MCP or by hand on the simulator): no results from these runs. If the second run fails, use superpowers:systematic-debugging before changing code.

- [ ] **Step 9: [device] Check recovery from leftover state**

Leave the app in each state below by hand on the simulator, then run `WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js` after each. Expected: passes every time.
1. New Contact sheet open with a first name typed.
2. A contact's Edit form open.
3. A contact card open.
4. Search active with text `zzz` typed in the contacts list.

- [ ] **Step 10: Commit**

```bash
git add screens support/appState.js support/hooks.js config/wdio.shared.conf.js tests/create-contact.test.js
git commit -m "Add Contacts screen objects, app reset and self-cleaning create test"
```

---

### Task 7: Lint rules for the new layout

**Files:**
- Modify: `eslint.config.js`, `package.json` (`lint-staged`)
- Create: `unit/lint.test.js`
- Modify: `.github/workflows/lint.yml` (run unit tests)

**Interfaces:**
- Produces: lint error message `Use a screen object method instead of a raw selector.` for raw selectors under `tests/`.

- [ ] **Step 1: Write the failing test**

Create `unit/lint.test.js`:

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:unit`
Expected: FAIL in `raw $ and $$ calls are rejected in tests` (0 matches, expected 3).

- [ ] **Step 3: Rewrite `eslint.config.js`**

```js
const js = require('@eslint/js');
const globals = require('globals');
const wdio = require('eslint-plugin-wdio');
const chaiFriendly = require('eslint-plugin-chai-friendly');

const RAW_SELECTOR = 'Use a screen object method instead of a raw selector.';

module.exports = [
  {
    ignores: ['allure-results/', 'allure-report/', 'test-results/']
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
```

- [ ] **Step 4: Run unit tests and lint**

Run: `npm run test:unit && npm run lint`
Expected: all unit tests pass; lint exits 0. If `wdio/await-expect` flags `expect(await x).toBe(y)` in tests, change those lines to `await expect(await x).toBe(y)` rather than disabling the rule.

- [ ] **Step 5: Widen lint-staged and run unit tests in CI**

In `package.json` replace the `"lint-staged"` block with:

```json
  "lint-staged": {
    "*.js": "eslint --fix"
  },
```

In `.github/workflows/lint.yml` add after the Lint step:

```yaml
      - name: Unit tests
        run: npm run test:unit
```

- [ ] **Step 6: Commit**

```bash
git add eslint.config.js unit/lint.test.js package.json .github/workflows/lint.yml
git commit -m "Ban raw selectors in tests and lint the new folders"
```

---

### Task 8: Search, edit and delete demo tests with prompts

**Files:**
- Create: `tests/search-contact.test.js`, `tests/edit-contact.test.js`, `tests/delete-contact.test.js`
- Create: `prompts/search-contact.md`, `prompts/edit-contact.md`, `prompts/delete-contact.md`
- Modify: `prompts/create-contact.md`, `prompts/templates/prompt-template.md`
- Move: `prompts/search-safari.md`, `prompts/create-reminder.md` → `prompts/archive/`

**Interfaces:**
- Consumes: all screens, `createContact`, `deleteContactByName`, `uniqueContact`, `registerCleanup`.

- [ ] **Step 1: Write the three tests**

Create `tests/search-contact.test.js`:

```js
const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: search', function () {
  it('finds a contact by full name and by last name', async function () {
    const contact = uniqueContact();
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    await ContactDetailScreen.goBack();

    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);

    await ContactsListScreen.clearSearch();
    await ContactsListScreen.search(contact.last);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);
  });
});
```

Create `tests/edit-contact.test.js`:

```js
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: edit', function () {
  it('updates a contact phone number', async function () {
    const contact = uniqueContact();
    const newPhone = uniqueContact().phone;
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    expect(await ContactDetailScreen.phoneDigits()).toBe(contact.phone);

    await ContactDetailScreen.tapEdit();
    await EditContactScreen.setPhone(newPhone);
    await EditContactScreen.save();

    expect(await ContactDetailScreen.phoneDigits()).toBe(newPhone);
  });
});
```

Create `tests/delete-contact.test.js`:

```js
const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: delete', function () {
  it('deletes a contact so search no longer finds it', async function () {
    const contact = uniqueContact();
    // Removes the contact only if the test fails before deleting it.
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    await ContactDetailScreen.tapEdit();
    await EditContactScreen.deleteContact();

    await ContactsListScreen.waitForDisplayed();
    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: [device] Run each new test once**

```bash
WDIO_RETRIES=0 npm test -- --spec tests/search-contact.test.js
WDIO_RETRIES=0 npm test -- --spec tests/edit-contact.test.js
WDIO_RETRIES=0 npm test -- --spec tests/delete-contact.test.js
```
Expected: each 1 passing. On failure, inspect `test-results/failures/*.xml` and fix the screen locator (not the test) unless the test's flow is wrong; use superpowers:systematic-debugging.

- [ ] **Step 3: Update the prompt template**

In `prompts/templates/prompt-template.md` replace the front matter with:

```markdown
---
title: <Scenario Name>
test: tests/<scenario>.test.js
version: 1
---
```

and add this section after `## Notes` (before `## Additional Context`):

```markdown
---

## Test Data

- Use `uniqueContact()` (or your app's equivalent factory in `support/testData.js`) instead of fixed names.
- Register cleanup for everything the test creates.
```

- [ ] **Step 4: Update `prompts/create-contact.md`**

Replace its front matter with:

```markdown
---
title: Create Contact
test: tests/create-contact.test.js
version: 2
---
```

In `## Test Steps`, replace steps 3–6 and 9 so they use generated data:

```markdown
3. Enter the generated first name (`uniqueContact().first`).
4. Enter the generated last name.
5. Add the generated phone number.
6. Add the generated email address.
```

```markdown
9. Search for the contact's full name and verify exactly one result.
```

Replace "**John Doe**" with "the new contact" in Expected Results and Exit Point, and replace the two duplicate-name bullets in Additional Context with `- Names are unique per run, so existing contacts do not affect the result.`

- [ ] **Step 5: Write the three new prompts**

Create `prompts/search-contact.md`:

```markdown
---
title: Search Contact
test: tests/search-contact.test.js
version: 1
---

# Search Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that a contact can be found by its full name and by its last name.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data.
2. Return to the contacts list.
3. Search for the contact's full name.
4. Verify exactly one result.
5. Clear the search, then search for the contact's last name only.
6. Verify exactly one result.

---

## Expected Results

- Both searches return exactly the new contact.

---

## Exit Point

- The contacts list is shown; cleanup deletes the contact.

---

## Notes

- Use the existing screen methods: `ContactsListScreen.search`, `clearSearch`, `waitForContactCount`.

---

## Test Data

- Use `uniqueContact()`; register `deleteContactByName` cleanup.
```

Create `prompts/edit-contact.md`:

```markdown
---
title: Edit Contact
test: tests/edit-contact.test.js
version: 1
---

# Edit Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that changing a contact's phone number is saved and shown on the contact card.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data, including a phone number.
2. Verify the contact card shows that phone number.
3. Tap **Edit**.
4. Replace the phone number with a second generated number.
5. Tap **Done**.
6. Verify the contact card shows the new number.

---

## Expected Results

- The contact card shows the new phone number after saving.

---

## Exit Point

- The contact card is shown; cleanup deletes the contact.

---

## Notes

- iOS formats phone numbers for display; compare digits only (`ContactDetailScreen.phoneDigits`).

---

## Test Data

- Use `uniqueContact()` for the contact and `uniqueContact().phone` for the new number; register `deleteContactByName` cleanup.
```

Create `prompts/delete-contact.md`:

```markdown
---
title: Delete Contact
test: tests/delete-contact.test.js
version: 1
---

# Delete Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that a deleted contact no longer appears in search.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data.
2. Tap **Edit**.
3. Scroll to and tap **Delete Contact**, then confirm.
4. Verify the contacts list is shown.
5. Search for the contact's full name.
6. Verify there are no results.

---

## Expected Results

- The contact is deleted and search returns nothing for its name.

---

## Exit Point

- The contacts list is shown with the search active.

---

## Notes

- Still register cleanup: it does nothing if the contact is already gone, and removes it if the test fails before deleting.

---

## Test Data

- Use `uniqueContact()`; register `deleteContactByName` cleanup.
```

- [ ] **Step 6: Archive prompts for other apps**

```bash
mkdir -p prompts/archive
git mv prompts/search-safari.md prompts/create-reminder.md prompts/archive/
```

- [ ] **Step 7: Lint and commit**

Run: `npm run lint && npm run test:unit`
Expected: both pass.

```bash
git add tests prompts
git commit -m "Add search, edit and delete Contacts tests with prompts"
```

---

### Task 9: Documentation

**Files:**
- Modify: `AGENTS.md`, `README.md`, `docs/future-updates.md`, `docs/appium-mcp-setup.md`, `docs/superpowers/specs/2026-10-15-starter-kit-design.md`

- [ ] **Step 1: Update AGENTS.md**

Make these replacements (keep all other content):

- In **Step 1**, replace the metadata bullet list (`Application` … `Exit point`) with: `- Test file path (front matter \`test:\`)`, `- Objective`, `- Entry point`, `- Test steps`, `- Expected results`, `- Exit point`, `- Test data rules`.
- Replace the body of **Step 2 — Determine the Execution Context** with:

```markdown
The app under test is configured once in `app.config.js`. Device settings live in `.env`.

Do not pass app identifiers (`APP_BUNDLE_ID`, `APP_PACKAGE`) on the command line, and do not edit `app.config.js` or `.env` to run a test.
```

- Replace the body of **Step 5 — Generate the Test** with:

```markdown
Build the test on screen objects.

1. Reuse an existing method in `screens/` or `screens/flows.js` when one does what a step needs.
2. Otherwise add a method (and its locator) to the screen it belongs to.
3. Otherwise create a new screen file extending `screens/BaseScreen.js`, with a `rootSelector` and locators written as `this.el({ ios: '...', android: '...' }, 'name')`.

Rules:

- Tests never contain raw selectors (`$`, `$$`, `browser.$`). Lint fails if they do.
- Screens contain locators and actions only. All `expect` calls live in the test.
- Screen actions wait for their own elements; tests do not call `waitForDisplayed` on elements.
- Use `uniqueContact()` from `support/testData.js` (or add a similar factory) instead of fixed names.
- Register cleanup with `registerCleanup(name, fn)` from `support/cleanup.js` for everything the test creates, right before creating it.
- Do not reset the app in the test: the `beforeTest` hook restarts it and returns to the home screen.

Save the test as `tests/<scenario>.test.js`, matching the prompt's `test:` field.
```

- Replace the body of **Step 6 — Execute the Test** with:

```markdown
Run only the test you are working on:

```bash
WDIO_RETRIES=0 npm test -- --spec tests/<scenario>.test.js
```

Then run `npm run lint`. Before reporting success, run the full suite with `npm test`.
```

- In **Step 7 — Diagnose Failures**, add to the investigation list: `- \`test-results/failures/\` (screenshot and page source of the failure)` and `- the Allure report (\`npm run report\`)`.
- In **Repository Responsibilities**, add to "This repository provides": `- Screen objects and shared flows`, `- App reset, test data and cleanup helpers`, `- Allure reporting`.
- Add a new section before **Success Criteria**:

```markdown
# Adopt this kit for your app

1. Set your app in `app.config.js` (`ios.bundleId`, and `android.appPackage` / `appActivity` if you test Android).
2. Set your device in `.env` (copy `.env.example`).
3. Replace `dismissLeftovers` in `support/appState.js` with what your app can be left showing after a restart, and make `resetToHome` wait for your home screen.
4. Delete the Contacts screens, `screens/flows.js` contents and `tests/*.test.js`, and replace `uniqueContact` with factories for your data.
5. Write prompts in `prompts/` from `prompts/templates/prompt-template.md` and give them to the agent.
```

- [ ] **Step 2: Update README.md**

- Badges: `WebdriverIO-9` → `WebdriverIO-10`, `Node.js-22` → `Node.js-24`.
- Architecture mermaid: change the edge label `npm run verify` to `npm test`, and add the lines `Test --> Screens[screens/*.js<br/>screen objects]` and `Agent -->|writes| Screens`.
- Replace the Quickstart command block and the paragraph and command block after it with:

```bash
git clone https://github.com/yashwant-das/ai-js-appium-mcp.git && cd ai-js-appium-mcp
nvm use                   # Node 24
npm install               # also installs Appium 3 and the XCUITest / UiAutomator2 drivers
cp .env.example .env      # your simulator name, iOS version and (optionally) UDID
npm run appium            # in a second terminal, with the simulator booted
npm test                  # runs every test against the app in app.config.js
```

```markdown
The app under test is set once in [app.config.js](app.config.js); no command needs an app ID. To have the agent write a new test, give it a prompt from `prompts/` (start new ones from [prompts/templates/prompt-template.md](prompts/templates/prompt-template.md)).
```

```bash
npm test -- --spec tests/create-contact.test.js   # one test
npm run test:android                               # Android (set android.* in app.config.js first)
npm run report                                     # build and open the Allure report
npm run test:unit                                  # unit tests for the support code
npm run clean                                      # delete test-results/ and Allure output
```

- In **Test reports and results**, replace the spec-reporter bullet with: `- The spec reporter prints results to the console; \`npm run report\` builds an Allure report from \`allure-results/\`. Failures attach a screenshot and the page source, also saved in \`test-results/failures/\`.` and add `- Lint also rejects raw selectors in \`tests/\`: every locator lives in a screen object.`
- Tech stack table: WebdriverIO row version `10`; Appium row `Appium 3, XCUITest 12, UiAutomator2 8` with "Pinned as devDependencies; `npm run appium`"; add row `| Reporting | Allure 3 with @wdio/allure-reporter | 3, 10 | Browsable report with failure screenshots, no Java needed |`; Assertions row `6, 10`.
- Replace the Project structure block with:

```text
├── AGENTS.md            # Workflow and rules for the AI agent
├── app.config.js        # The app under test
├── config/              # WDIO config: shared, iOS, Android
├── screens/             # Screen objects and shared flows
├── support/             # App reset, hooks, test data, cleanup, gestures
├── tests/               # Agent-written WebdriverIO tests
├── unit/                # node:test unit tests for support code and lint rules
├── prompts/             # Markdown test plans (templates/, archive/)
├── docs/                # Appium MCP setup, specs, plans, notes
└── eslint.config.js
```

- In "What this repo does and doesn't do", change the row `| Creates and manages Appium sessions | Generic WebdriverIO configuration |` to `| Creates and manages Appium sessions | WebdriverIO config, screen objects, app reset and cleanup |`.
- Add a Troubleshooting section before Documentation:

```markdown
## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:4723`**: Appium isn't running. Start it with `npm run appium`.
- **`No Android app configured`**: set `android.appPackage` and `android.appActivity` in `app.config.js`.
- **A test starts on the wrong screen**: add that screen to `dismissLeftovers` in `support/appState.js`.
```

- [ ] **Step 3: Update docs**

- `docs/future-updates.md`: remove items 1, 2, 3, 5 and 6 (done: app reset, `noReset` documented, scrolling, state awareness, Allure). Keep item 4 and item 7, renumbered 1 and 2, and add under item 7: `Config, capabilities and locator slots for Android exist; what's missing is a demo app and an Android pass.`
- `docs/appium-mcp-setup.md`: add after the intro line: `Tested with appium-mcp 1.97.1, Appium 3.8.0 and appium-xcuitest-driver 12.18.1.`
- Spec: add a section `## 13. Changes made during planning` listing the deviations from the plan's "Deviations from the spec" paragraph, one bullet each.

- [ ] **Step 4: Check that docs match the scripts**

Run: `grep -rn "APPIUM_BUNDLE_ID\|npm run verify\|wdio.conf.js\|tests/helpers" README.md AGENTS.md prompts docs/*.md`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md README.md docs
git commit -m "Document the starter kit workflow"
```

---

### Task 10: Final verification

Run every check from spec §11 and report results with output. Use superpowers:verification-before-completion.

- [ ] **Step 1: Static checks**

Run: `npm run lint && npm run test:unit`
Expected: lint exit 0; all unit tests pass (includes the raw-selector rule test).

- [ ] **Step 2: [device] Full suite twice, no retries**

```bash
npm run clean
WDIO_RETRIES=0 npm test
WDIO_RETRIES=0 npm test
```
Expected: 4 passing both times, no `Cleanup ... failed` warnings. Then search Contacts for `Doe-`: no results.

- [ ] **Step 3: [device] Single-spec run**

Run: `WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js`
Expected: exactly 1 test runs and passes.

- [ ] **Step 4: [device] Report and failure artifacts**

Break one locator (`'~Add'` → `'~AddBroken'` in `screens/ContactsListScreen.js` `addButton`), then run `WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js`. Expected: fails; `test-results/failures/` has a `.png` and `.xml`. Restore with `git checkout screens/ContactsListScreen.js`. Run `npm run report`: the report lists the tests from Step 2 runs and the failed run with "Failure screenshot" and "Page source" attachments.

- [ ] **Step 5: Android message**

Run: `npm run test:android`
Expected: exits non-zero with `No Android app configured: set android.appPackage in app.config.js`.

- [ ] **Step 6: Clean tree**

Run: `git status --short`
Expected: empty (generated folders are ignored). Report to the user: what passed with evidence, that Android was not exercised beyond config loading, and that nothing is pushed.
