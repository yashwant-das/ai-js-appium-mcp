Use Appium MCP tools to automate the following steps on an iOS simulator:

1. Open the Reminders app on the iOS simulator.
2. Tap "New Reminder" button.
3. Enter the title "Test reminder from Appium" in the title field.
4. Tap "Done" to save the reminder.
5. Verify the reminder appears in the list (check that "All" or "Reminders" list shows 1 reminder).
6. Generate a JavaScript Appium test that automates all completed steps and save it as tests/generated.test.js.

Important: Use Appium MCP tools for all interactions:
- Use `appium_session_management` to create/manage sessions
- Use `appium_find_element` with accessibility id strategy to locate elements
- Use `appium_gesture` with action=tap for button taps
- Use `appium_set_value` to enter text into fields
- Use `appium_get_page_source` or `appium_get_element_attribute` for verification
- Use `appium_generate_tests` to generate the test file
