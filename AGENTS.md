# AGENTS.md

# Appium MCP Playground - AI Agent Instructions

## Purpose

This repository is a lightweight execution harness for AI-generated WebdriverIO mobile tests.

The AI agent is responsible for the complete automation lifecycle:

- Read and understand the user's Markdown test plan.
- Determine the execution context from the prompt metadata.
- Analyze the application using Appium MCP.
- Generate a WebdriverIO test.
- Execute the test.
- Diagnose failures.
- Improve the test.
- Repeat until the test passes.

This repository intentionally does **not** include a prompt parser, custom code generator, or framework-specific DSL. The Markdown test plan is the specification and source of truth.

---

# High-Level Workflow

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

# Primary Objective

Given a Markdown test plan, generate a complete, executable WebdriverIO test that successfully automates the requested scenario.

A task is complete only when:

- The generated test executes successfully.
- All assertions pass.
- The requested workflow is completed.
- No runtime errors remain.

---

# Agent Workflow

Always follow this sequence.

---

## Step 1 — Read the Test Plan

Read the Markdown file provided by the user.

Extract the scenario metadata, including:

- Application
- Platform
- Bundle ID (iOS)
- Package name (Android)
- Entry point
- Test steps
- Expected results
- Exit point

The Markdown document is the source of truth.

Do not modify or reinterpret the business requirements.

---

## Step 2 — Determine the Execution Context

Read the project configuration (`.env` and `wdio.conf.js`).

Use the prompt metadata to determine the execution context.

Application-specific values such as:

- `APPIUM_PLATFORM`
- `APPIUM_BUNDLE_ID`
- `APPIUM_APP_PACKAGE`
- `APPIUM_APP_ACTIVITY`

should be supplied during test execution without modifying the project configuration.

---

## Step 3 — Connect to the Device

Assume the user has already:

- Started the Appium server.
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

## Step 4 — Analyze the Application

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

## Step 5 — Generate the Test

Generate a complete standalone WebdriverIO test.

Save the test under:

```text
tests/<scenario>.test.js
```

Generated tests should:

- use modern WebdriverIO APIs
- be readable
- be maintainable
- contain meaningful assertions
- minimize unnecessary waits
- execute independently
- use stable selectors

Generate production-quality automation.

Do not generate partial implementations.

---

## Step 6 — Execute the Test

Execute the generated test using the project configuration.

Examples:

```bash
npm run verify
```

or

```bash
npm run verify -- tests/<scenario>.test.js
```

Wait for execution to complete before proceeding.

---

## Step 7 — Diagnose Failures

If execution fails, investigate using:

- execution logs
- screenshots
- page source
- generated locators
- Appium MCP inspection tools

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

## Step 8 — Improve the Test

Update only what is necessary.

Examples include:

- improving selectors
- scrolling before interaction
- waiting for visibility
- dismissing alerts
- refining assertions

Keep the generated automation simple and maintainable.

---

## Step 9 — Repeat

Execute the updated test again.

Continue until:

- execution succeeds
- all assertions pass

Do not stop after the first failure.

---

## Step 10 — Notify the User

Once the test passes, inform the user that:

- the test was generated
- execution completed successfully
- all assertions passed

---

# Appium MCP Usage Guidelines

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

# Recommended Tool Usage

## Session Management

- `select_device`
- `prepare_ios_simulator`
- `appium_session_management`

## Application Analysis

- `generate_locators`
- `appium_find_element`
- `appium_get_page_source`
- `appium_screenshot`

## Navigation

- `appium_gesture`
- `appium_set_value`
- `appium_alert`
- `appium_context`

## Validation

- `appium_get_text`
- `appium_find_element`

---

# Locator Strategy

Prefer stable locators using the following priority:

1. Accessibility ID
2. Resource ID
3. Native platform locators
4. XPath (last resort)

Avoid brittle XPath whenever possible.

---

# Test Generation Principles

Generated tests should be:

- deterministic
- readable
- maintainable
- self-contained
- production quality

Avoid:

- unnecessary sleeps
- duplicated code
- fragile selectors
- excessive XPath
- hardcoded coordinates

---

# Failure Recovery

When a test fails:

1. Inspect the application.
2. Determine the root cause.
3. Update the generated test.
4. Execute the test again.

Repeat until the test passes successfully.

---

# Repository Responsibilities

This repository provides:

- Markdown test scenarios
- Generic WebdriverIO configuration
- Execution harness
- Generated test location
- Debug artifacts

This repository does **not** provide:

- prompt parsing
- custom code generation
- Appium server management
- simulator management
- emulator management
- device provisioning

Those responsibilities remain with the user and the AI agent.

---

# Success Criteria

A task is complete only when:

- The Markdown scenario has been fully automated.
- The generated WebdriverIO test passes.
- No failing assertions remain.
- The user has been informed of successful execution.