---
title: Calculator Basic Operations
app: calculator
version: 1
---

# Calculator Basic Operations

Test basic arithmetic operations in the iOS Calculator app.

## Entry Point

- App: Calculator (bundleId: `com.apple.calculator`)
- Starting state: Calculator app is open with display showing "0"
- Device: iOS Simulator with iPhone 15

## Steps:

1. Tap the number "2" button
2. Tap the number "5" button
3. Tap the "+" (addition) button
4. Tap the number "7" button
5. Tap the number "3" button
6. Tap the "=" (equals) button
7. Verify the result displays "35"
8. Tap the "AC" (all clear) button to reset
9. Verify the display shows "0"

## MCP Tools to use:

- appium_session_management (activate calculator app)
- appium_find_element (accessibility id strategy for buttons)
- appium_gesture (action=tap for button presses)
- appium_get_element_attribute (read display value)
- appium_get_page_source (verify final state)

## Exit Point

- Calculator display shows "0" after AC tap
- Page source contains no pending operation indicators
- Test is complete and app is in clean state

## Notes

- Calculator buttons use accessibility labels like "2", "5", "+", "=", "AC"
- The display area shows the current number as the app's label or name attribute
- Wait 500ms after each button tap for the calculator to process
- The "AC" button clears all state including any pending operations
