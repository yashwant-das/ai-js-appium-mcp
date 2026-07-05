---
title: Create Reminder
app: reminders
version: 1
---

# Create Reminder

Create a new reminder in the Reminders app on the iOS simulator and verify it appears in the list.

## Entry Point

- App: Reminders (bundleId: `com.apple.reminders`)
- Starting state: Reminders app is open on the main lists screen
- Device: iOS Simulator

## Steps:

1. Open the Reminders app on the iOS simulator
2. Tap "New Reminder" button
3. Enter the title "Test reminder from Appium" in the title field
4. Tap "Done" to save the reminder
5. Verify the reminder appears in the list (check that "All" or "Reminders" list shows 1 reminder)

## MCP Tools to use:

- appium_session_management (create/manage sessions)
- appium_find_element (accessibility id strategy)
- appium_gesture (action=tap for button taps)
- appium_set_value (enter text into fields)
- appium_get_page_source (verify content)
- appium_generate_tests (generate WDIO test file)

## Exit Point

- Reminders returns to the list screen
- The newly created reminder title is visible or the reminder count increased

## Notes:

Add any additional notes or context here that the AI agent should know.
