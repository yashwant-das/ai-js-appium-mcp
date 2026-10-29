# ai-js-appium-mcp - AI Agent Instructions

> This file is for the AI agent. People start at [README.md](README.md); [docs/architecture.md](docs/architecture.md) explains the code the agent works with.

## Purpose

This repository is an execution harness for AI-generated WebdriverIO mobile tests.

The AI agent is responsible for the complete automation lifecycle:

- Read and understand the user's Markdown test plan.
- Determine the execution context from `app.config.js` and `.env`.
- Analyze the application using Appium MCP.
- Generate a WebdriverIO test.
- Execute the test.
- Diagnose failures.
- Improve the test.
- Repeat until the test passes.

This repository intentionally does **not** include a prompt parser, custom code generator, or framework-specific DSL. The Markdown test plan is the specification and source of truth.

---

## High-Level Workflow

```text
Markdown Test Plan
        │
        ▼
Read Metadata
        │
        ▼
Determine Execution Context
        │
        ▼
Appium MCP Analysis
        │
        ▼
Generate WDIO Test
        │
        ▼
Execute Test
        │
        ▼
Pass?
   │          │
 No          Yes
   │          │
Diagnose   Notify User
   │
Update Test
   │
Repeat
```

---

## Primary Objective

Given a Markdown test plan, generate a complete, executable WebdriverIO test that successfully automates the requested scenario.

A task is complete only when:

- The generated test executes successfully.
- All assertions pass.
- The requested workflow is completed.
- No runtime errors remain.

---

## Agent Workflow

Always follow this sequence.

---

### Step 1 — Read the Test Plan

Read the Markdown file provided by the user.

Extract from the prompt:

- Test file path (front matter `test:`)
- Objective
- Entry point
- Test steps
- Expected results
- Exit point
- Test data rules

The Markdown document is the source of truth.

Do not modify or reinterpret the business requirements.

---

### Step 2 — Determine the Execution Context

The app under test is configured once in `app.config.js`. Device settings live in `.env`.

Do not pass app identifiers (`APP_BUNDLE_ID`, `APP_PACKAGE`) on the command line, and do not edit `app.config.js` or `.env` to run a test.

---

### Step 3 — Connect to the Device

Assume the user has already:

- Started the Appium server (`npm run appium` starts the project's pinned Appium and drivers).
- Started the iOS Simulator or Android Emulator.
- Configured Appium MCP.

Do not start Appium.

Do not launch devices.

Reuse an existing Appium session when appropriate. Otherwise create one using Appium MCP.

Typical flow:

1. `select_device`
2. `prepare_ios_simulator` (iOS Simulator only)
3. `appium_session_management`

---

### Step 4 — Analyze the Application

Before generating automation, inspect the running application using Appium MCP.

Useful tools include:

- `generate_locators`
- `appium_find_element`
- `appium_get_page_source`
- `appium_screenshot`
- `appium_context`
- `appium_app_lifecycle`

Use these tools to understand:

- UI hierarchy
- Navigation flow
- Stable element locators
- Accessibility identifiers
- Required gestures
- Dynamic content

Prefer inspecting the application over guessing selectors.

---

### Step 5 — Generate the Test

Build the test on screen objects.

1. Reuse an existing method in `screens/` or `screens/flows.js` when one does what a step needs.
2. Otherwise add a method (and its locator) to the screen it belongs to.
3. Otherwise create a new screen file extending `screens/BaseScreen.js`, with a `rootSelector` and locators written as `this.el({ ios: '...', android: '...' }, 'name')`.

The kit runs on iOS and Android. Give every new element a locator for each platform you can inspect, and keep platform differences inside screen methods (`this.isIOS`). Tests never check the platform. Run the test on each platform: `npm test -- --spec ...` (iOS) and `npm run test:android -- --spec ...`.

Rules:

- Tests never contain raw selectors (`$`, `$$`, `browser.$`). Lint fails if they do.
- Screens contain locators and actions only. All `expect` calls live in the test.
- Screen actions wait for their own elements; tests do not call `waitForDisplayed` on elements.
- WebdriverIO 10 uses strict selectors: `$()` throws when a selector matches more than one element. Make locators unique, or use `$$()` in the screen when several matches are expected.
- Use `uniqueContact()` from `support/testData.js` (or add a similar factory) instead of fixed names.
- Register cleanup with `registerCleanup(name, fn)` from `support/cleanup.js` for everything the test creates, right before creating it.
- Do not reset the app in the test: the `beforeTest` hook restarts it and returns to the home screen.

Save the test as `tests/<scenario>.test.js`, matching the prompt's `test:` field.

---

### Step 6 — Execute the Test

Run only the test you are working on:

```bash
WDIO_RETRIES=0 npm test -- --spec tests/<scenario>.test.js
```

Then run `npm run lint`. Before reporting success, run the full suite with `npm test`.

---

### Step 7 — Diagnose Failures

If execution fails, investigate using:

- execution logs
- screenshots
- page source
- generated locators
- Appium MCP inspection tools
- `test-results/failures/` (screenshot and page source of the failure)
- the Allure report (`npm run report`)

Common issues include:

- incorrect locator
- timing issue
- unexpected application state
- missing scroll
- alert dialog
- invalid assertion

Inspect first.

Avoid guessing.

---

### Step 8 — Improve the Test

Update only what is necessary, in the right place:

- In the screen object: improving locators, scrolling before interaction, waiting for elements, dismissing alerts.
- In `support/appState.js`: handling a screen the app can be left on after a restart (`dismissLeftovers`).
- In the test: refining assertions and the order of steps.

Keep the generated automation simple and maintainable.

---

### Step 9 — Repeat

Execute the updated test again.

Continue until:

- execution succeeds
- all assertions pass

Do not stop after the first failure.

---

### Step 10 — Notify the User

Once the test passes, inform the user that:

- the test was generated
- execution completed successfully
- all assertions passed

---

## Appium MCP Usage Guidelines

Appium MCP is the automation interface used to inspect and interact with the running application.

Use it to:

- create or attach to Appium sessions
- inspect the UI hierarchy
- discover stable locators
- navigate the application
- perform gestures
- capture screenshots
- inspect page source

Choose the Appium MCP tools that best fit the scenario. Prefer reliable and stable interactions over brittle implementations.

---

## Recommended Tool Usage

### Session Management

- `select_device`
- `prepare_ios_simulator`
- `appium_session_management`

### Application Analysis

- `generate_locators`
- `appium_find_element`
- `appium_get_page_source`
- `appium_screenshot`

### Navigation

- `appium_gesture`
- `appium_set_value`
- `appium_context`

### Validation

- `appium_get_text`
- `appium_find_element`

---

## Locator Strategy

Prefer stable locators using the following priority:

1. Accessibility ID (`~name`)
2. iOS predicate string or class chain; Android resource ID
3. XPath (last resort)

Avoid brittle XPath whenever possible.

---

## Test Generation Principles

Generated tests should be:

- deterministic
- readable
- maintainable
- independent of other tests and of earlier runs
- production quality

Avoid:

- unnecessary sleeps
- duplicated code
- fragile selectors
- excessive XPath
- hardcoded coordinates

---

## Failure Recovery

When a test fails:

1. Inspect the application.
2. Determine the root cause.
3. Update the screen object, `support/appState.js` or the test, whichever holds the cause.
4. Execute the test again.

Repeat until the test passes successfully.

---

## Repository Responsibilities

This repository provides:

- Markdown test scenarios
- Generic WebdriverIO configuration
- Execution harness
- Generated test location
- Debug artifacts
- Screen objects and shared flows
- App reset, test data and cleanup helpers
- Allure reporting

This repository does **not** provide:

- prompt parsing
- custom code generation
- running the Appium server for you (it is pinned in `package.json`; you start it)
- simulator management
- emulator management
- device provisioning

Those responsibilities remain with the user and the AI agent.

---

## Adopting the kit for another app

If the user asks you to switch the kit to a different app, follow [Using it for your own app](README.md#using-it-for-your-own-app) in the README.

---

## Success Criteria

A task is complete only when:

- The Markdown scenario has been fully automated.
- The generated WebdriverIO test passes.
- No failing assertions remain.
- The user has been informed of successful execution.
