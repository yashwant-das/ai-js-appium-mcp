# Starter Kit Design: ai-js-appium-mcp

Date: 2026-10-15
Status: Approved in chat, awaiting written-spec review
Branch: `feat/starter-kit`

## 1. Intent

### What the user said

- Running a new test file today needs a hand-built command such as
  `APPIUM_BUNDLE_ID=com.apple.MobileAddressBook npm run verify -- "tests/create-contact.test copy.js"`.
- The repo should become a usable framework, "more like a starter kit".
- Scope is **one app per project**. The Contacts app (`com.apple.MobileAddressBook`) is the demo.
- Structure: screen objects with shared hooks.
- First version includes more Contacts demo tests, test-data isolation, Allure reporting and Android-ready config.
- Test data: unique names per run, deleted through the UI afterwards.
- Approach: evolve the current CommonJS JavaScript setup (no TypeScript, no third-party boilerplate).
- Use the latest stable dependencies as of October 2026, including Appium and Allure.
- No subagents are used anywhere in the design, planning or implementation of this work.

### Assumptions

- The AI-agent workflow (Markdown prompt → Appium MCP inspection → WebdriverIO test → run and fix) stays the core idea of the repo. The framework makes the agent's output easier to run and maintain; it does not replace the agent.
- The user still starts the simulator themselves. The kit does not manage simulators, emulators or devices.
- CI keeps running lint only; UI tests run locally.

### Root cause of the current problem

`wdio.conf.js` has a single capability block whose app comes only from the `APPIUM_BUNDLE_ID` environment variable. Nothing ties a test to its app, so every run needs the variable on the command line, and the test itself reads `process.env.APPIUM_BUNDLE_ID` to reset the app.

### Success criteria

1. `npm test` runs every test and `npm test -- --spec <file>` runs one, with no environment variables on the command line.
2. A new user adopts the kit for their app by editing `app.config.js`, replacing `screens/` and writing prompts.
3. Four Contacts tests pass twice in a row on the iOS 27 simulator; the second run proves cleanup works.
4. Tests contain no raw selectors; lint enforces it.
5. `npm run report` opens an Allure report, and failures carry a screenshot and page source.

## 2. Dependency baseline

Versions checked against the npm registry on 2026-10-15. Pin with caret ranges at these minimums.

| Package | Version | Notes |
| --- | --- | --- |
| `@wdio/cli`, `@wdio/local-runner`, `@wdio/globals` | 10.0.2 | |
| `@wdio/mocha-framework`, `@wdio/spec-reporter` | 10.0.1 | |
| `@wdio/allure-reporter` | 10.0.1 | new |
| `allure` | 3.20.1 | new; Allure 3 CLI, pure Node, no Java |
| `appium` | 3.8.0 | new as devDependency |
| `appium-xcuitest-driver` | 12.18.1 | new as devDependency |
| `appium-uiautomator2-driver` | 8.7.0 | new as devDependency |
| `chai` | 6.3.0 | bump |
| `dotenv` | 18.0.8 | major bump; read the changelog before upgrading |
| `eslint` | 10.12.0 | bump |
| `@eslint/js` | 10.0.1 | |
| `eslint-plugin-wdio` | 10.0.1 | |
| `eslint-plugin-chai-friendly` | 1.2.1 | |
| `globals` | 17.13.0 | bump |
| `husky` | 9.1.7 | |
| `lint-staged` | 17.6.0 | bump; needs Node >= 22.22.1 |

`appium-mcp` (1.97.1) stays in the user's agent configuration, not in `package.json`; `docs/appium-mcp-setup.md` records the tested version.

Node: `engines.node` is `">=24"` and `.nvmrc` contains `24` (Active LTS). README badges are updated from WDIO 9 / Node 22 to WDIO 10 / Node 24.

With Appium and drivers as devDependencies, running Appium from the project (`npm run appium`) uses the project's pinned driver versions. A global Appium install keeps working.

## 3. Layout

```text
├── app.config.js              # app under test: iOS bundleId, Android appPackage/appActivity
├── config/
│   ├── wdio.shared.conf.js    # runner, Mocha, timeouts, reporters, hooks
│   ├── wdio.ios.conf.js       # XCUITest capabilities
│   └── wdio.android.conf.js   # UiAutomator2 capabilities
├── screens/
│   ├── BaseScreen.js
│   ├── ContactsListScreen.js
│   ├── NewContactScreen.js
│   ├── ContactDetailScreen.js
│   └── EditContactScreen.js
├── support/
│   ├── hooks.js
│   ├── testData.js
│   └── gestures.js
├── tests/                     # *.test.js only
├── prompts/
│   ├── templates/prompt-template.md
│   └── archive/               # prompts for apps other than the configured one
├── docs/
├── .env.example               # machine-only values
├── .nvmrc
├── AGENTS.md
└── eslint.config.js
```

Removed: root `wdio.conf.js` (replaced by `config/`), `tests/helpers/` (replaced by `support/`), the stray `tests/create-contact.test copy.js`, and committed files under `test-results/`.

## 4. Configuration

### `app.config.js`

Checked in. Holds the app identity, which is neither secret nor machine-specific:

```js
module.exports = {
  name: 'Contacts',
  ios: { bundleId: 'com.apple.MobileAddressBook' },
  android: { appPackage: '', appActivity: '' }
};
```

Each value can be overridden by an environment variable (`APP_BUNDLE_ID`, `APP_PACKAGE`, `APP_ACTIVITY`), but nothing requires one.

### `.env`

Machine-specific values only: `APPIUM_HOST`, `APPIUM_PORT`, `APPIUM_PATH`, `IOS_DEVICE_NAME`, `IOS_PLATFORM_VERSION`, `IOS_UDID`, `ANDROID_DEVICE_NAME`, `ANDROID_PLATFORM_VERSION`, `ANDROID_UDID`, `WDIO_LOG_LEVEL`, `WDIO_RETRIES`. `.env.example` documents each one, including that `noReset` is fixed to `true` because the `beforeTest` hook restarts the app.

### WDIO configs

- `config/wdio.shared.conf.js`: `specs: ['../tests/**/*.test.js']`, Mocha BDD, timeouts carried over from the current config, reporters `spec` and `allure` (`outputDir: 'allure-results'`, `disableWebdriverStepsReporting: true`, `disableWebdriverScreenshotsReporting: false`), and the hooks from `support/hooks.js`.
- `config/wdio.ios.conf.js`: spreads the shared config and adds one XCUITest capability using `app.config.js` and the `IOS_*` variables. `appium:noReset: true`.
- `config/wdio.android.conf.js`: same for UiAutomator2. If `appPackage` is empty it throws at load time with the message `No Android app configured: set android.appPackage in app.config.js`.

The hard-coded UDID default in the current config is removed. If `IOS_UDID` is unset, the capability omits it and Appium picks a simulator by name and version.

### npm scripts

| Script | Command |
| --- | --- |
| `test` | `wdio run config/wdio.ios.conf.js` |
| `test:ios` | same as `test` |
| `test:android` | `wdio run config/wdio.android.conf.js` |
| `verify` | alias of `test`, kept for existing habits and older prompts |
| `appium` | `appium` (project-local) |
| `report` | `allure generate allure-results -o allure-report && allure open allure-report` (exact Allure 3 CLI syntax confirmed during implementation) |
| `clean` | `rm -rf test-results allure-results allure-report` (no longer deletes tests) |
| `lint`, `lint:fix`, `prepare` | unchanged |

`.gitignore` adds `test-results/`, `allure-results/`, `allure-report/`.

## 5. Screen objects

### `screens/BaseScreen.js`

- `get root()`: element that proves the screen is showing; each screen overrides it.
- `waitForDisplayed()`: waits on `root`.
- `sel({ ios, android })`: returns the locator for the current platform using `driver.isIOS`. Throws a clear error if the current platform's locator is missing.
- `tap(el)`, `type(el, text)` (clear then add), `tapIfVisible(el, timeout)`, `scrollTo(el)`: thin wrappers over `support/gestures.js`, each waiting for the element first.

### Contacts screens

Each file exports a single instance.

| Screen | Methods |
| --- | --- |
| `ContactsListScreen` | `tapAdd()`, `search(text)`, `clearSearch()`, `openContact(fullName)`, `contactCells(fullName)` |
| `NewContactScreen` | `fill({ first, last, phone, email })`, `save()`, `cancelAndDiscard()` |
| `ContactDetailScreen` | `headerName()`, `phoneValue()`, `tapEdit()`, `goBack()` |
| `EditContactScreen` | `setPhone(phone)`, `save()`, `deleteContact()` |

Locators from the current `create-contact.test.js` move into these files unchanged (`~Add`, `~First name`, `~Last name`, `~Insert add phone`, `~Insert add email`, the `New Contact` navigation-bar predicate, `~Done`, `~ContactCardHeaderView`, `~BackButton`, the `XCUIElementTypeCell` predicate). Locators for search, edit and delete are found with Appium MCP during implementation.

### Rules

- Screens hold locators and actions only. All assertions live in tests.
- Actions wait for their own elements; tests do not call `waitForDisplayed` on raw elements.
- Methods that read values return them; action methods return nothing. No fluent chaining.
- Locator priority: accessibility ID → iOS predicate / class chain or Android resource ID → XPath only as a last resort.

## 6. Support modules

### `support/hooks.js`

- `beforeTest`: terminate and activate the configured app (`mobile: terminateApp` / `mobile: activateApp` on iOS, `mobile: terminateApp` / `mobile: activateApp` with `appId` on Android). Then dismiss known leftovers with `tapIfVisible`: the keyboard intro `~Continue`, and an open New Contact sheet (`~close` then `~Discard Changes`). Finally wait for `ContactsListScreen`. The leftover list is app-specific and lives in an exported `dismissLeftovers` function that adopters replace.
- `afterTest`: on failure, save a screenshot and page source to `test-results/failures/<test>_<timestamp>.{png,xml}` and attach both to Allure. Then run the registered cleanup tasks in reverse order. Each cleanup error is logged and attached to Allure as text, and never fails the test.

### `support/testData.js`

- `runId`: base-36 timestamp, computed once per worker.
- `uniqueContact(overrides)`: returns `{ first: 'John', last: 'Doe-<runId><n>', phone, email }`, where `n` is a per-worker counter and phone and email are derived from the same suffix. `fullName` is included for convenience.
- `registerCleanup(fn)` and `runCleanups()`: the queue used by `afterTest`.
- `deleteContactCleanup(fullName)`: returns a function that restarts the app to the list, searches the name, opens the contact, taps Edit and deletes it. If the search finds no matching contact it returns without error. Tests register it right after creating a contact.

### `support/gestures.js`

- `scrollTo(element)`: iOS uses `mobile: scroll` with the element's predicate or name, falling back to swipes up to a fixed limit. Android uses `UiScrollable` through `android=` selectors.
- `tapIfVisible(element, timeout)`: returns `true` if it tapped, `false` otherwise; never throws.

## 7. Demo tests and prompts

Every test registers cleanup for each contact it creates.

| Test | Prompt | Flow | Assertions |
| --- | --- | --- | --- |
| `create-contact.test.js` | `create-contact.md` | add a unique contact with phone and email | detail header shows the full name; one matching cell in the list |
| `search-contact.test.js` | `search-contact.md` | create a contact, search for it | exactly one result with the full name |
| `edit-contact.test.js` | `edit-contact.md` | create a contact, edit the phone, save | detail screen shows the new phone |
| `delete-contact.test.js` | `delete-contact.md` | create a contact, delete it | search returns no result for the name |

`delete-contact` registers cleanup like the others. If the test deletes the contact, the cleanup's search finds nothing and it returns without error; if the test fails before deleting, cleanup removes the contact.

Prompts drop `bundleId` from front matter (the app comes from `app.config.js`). `prompts/search-safari.md` and `prompts/create-reminder.md` move to `prompts/archive/`. The prompt template is updated to match.

## 8. Agent workflow (AGENTS.md)

- Step 2 (execution context): read `app.config.js`; do not pass app IDs as environment variables.
- Step 5 (generate): reuse an existing screen method → otherwise add a method to the matching screen → otherwise create a new screen file. Tests never contain raw selectors. Register cleanup for any data the test creates; use `uniqueContact()` (or an equivalent factory) instead of fixed names.
- Step 6 (execute): `npm test -- --spec tests/<scenario>.test.js`.
- Step 7 (diagnose): look at `test-results/failures/` and the Allure report as well as the console.
- New section "Adopt this kit for your app": edit `app.config.js`, replace `dismissLeftovers` in `support/hooks.js`, replace `screens/`, write prompts, delete the Contacts tests.

## 9. Lint

- Lint covers `config/`, `screens/`, `support/`, `tests/` and the root config files.
- In `tests/**`, `no-restricted-syntax` bans calls to `$`, `$$`, `driver.$`, `driver.$$`, `browser.$`, `browser.$$` with the message "Use a screen object method instead of a raw selector."
- Existing rules (`wdio/await-expect`, `wdio/no-debug`, `wdio/no-pause`, `chai-friendly/no-unused-expressions`) stay.
- lint-staged globs widen to cover `screens/` and `support/`.

## 10. Error handling

- Missing app identity for the selected platform: config throws at load time with a message naming the `app.config.js` field to set.
- Missing locator for the current platform: `sel()` throws `<Screen>.<locator> has no <platform> locator`.
- Appium not reachable: WDIO's own connection error stands; the README troubleshooting section says to run `npm run appium` or start Appium.
- Cleanup failures never fail a test; they are logged and attached to Allure.

## 11. Verification (definition of done)

1. `npm run lint` is clean, and a test file containing `$('~Add')` fails lint with the screen-object message.
2. `npm test` passes all four tests on the iOS 27 simulator.
3. A second `npm test` run immediately afterwards also passes, and the contacts list contains no `Doe-` contacts from either run.
4. `npm test -- --spec tests/create-contact.test.js` runs only that test.
5. `npm run report` produces a report listing the four tests.
6. Temporarily breaking one locator produces a failure with a screenshot and page source in `test-results/failures/` and attached in Allure; the locator is then restored.
7. `npm run test:android` with an empty `android.appPackage` exits with the "No Android app configured" message. No Android pass is claimed; there is no Android demo app.
8. README and AGENTS.md commands match the scripts that exist.

## 12. Out of scope

- TypeScript.
- Running UI tests in CI.
- Simulator, emulator or device management.
- An Android demo app or Android test pass.
- Multi-app support in one project.
- Parallel test execution (`maxInstances` stays 1; the tests share one simulator).
