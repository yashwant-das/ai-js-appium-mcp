---
title: Scenario Title
app: reminders
version: 1
---

# Scenario Title

Describe what this test scenario covers in one sentence.

## Entry Point

- App: Reminders (bundleId: `com.apple.reminders`)
- Starting state: Describe the exact starting screen/state
- Device: iOS Simulator

## Steps:

1. Open the Reminders app on the iOS simulator
2. Tap "New Reminder" button
3. Enter the title "Test reminder" in the title field
4. Tap "Done" to save the reminder
5. Verify the reminder appears in the list

## MCP Tools to use:

- appium_session_management (create session)
- appium_find_element (accessibility id strategy)
- appium_gesture (action=tap for button taps)
- appium_set_value (enter text into fields)
- appium_get_page_source (verify content)
- appium_generate_tests (generate WDIO test file)

## Exit Point

- Describe the final screen/state
- Describe the assertion or page source check that proves success

## Notes:

Add any additional notes or context here that the AI agent should know.
