---
title: Create Reminder
app: reminders
platform: ios
bundleId: com.apple.reminders
version: 1
---

# Create Reminder

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Create a new reminder in the Reminders app and verify that it is successfully saved and displayed in the reminders list.

---

## Entry Point

- Appium server is running.
- An iOS Simulator is running.
- The Reminders app is installed.
- The Reminders app is open on the main reminders list.

---

## Test Steps

1. Open the Reminders app if it is not already active.
2. Tap **New Reminder**.
3. Enter the reminder title **"Test reminder from Appium"**.
4. Tap **Done** to save the reminder.
5. Return to the reminders list if necessary.
6. Verify that the newly created reminder **"Test reminder from Appium"** is visible in the reminders list.

---

## Expected Results

- A new reminder titled **"Test reminder from Appium"** is created successfully.
- The reminder is displayed in the reminders list.
- No validation or application errors are displayed.

---

## Exit Point

- The Reminders app remains open.
- The reminders list is displayed.
- The newly created reminder **"Test reminder from Appium"** is visible.

---

## Notes

- Handle any permission dialogs if they appear.
- Prefer stable accessibility identifiers over XPath whenever possible.
- Wait for UI transitions only when necessary.
- Scroll if the reminder is not immediately visible after saving.
- Existing reminders should not affect validation.

---

## Additional Context (Optional)

- The Reminders app may already contain existing reminders.
- If reminders are sorted differently, locate the newly created reminder by its title before completing the test.
- On some versions of iOS, the keyboard may remain visible after entering the reminder title. Dismiss it only if it prevents accessing the **Done** button.