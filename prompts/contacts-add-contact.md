---
title: Contacts Add Contact
app: contacts
version: 2
---

# Contacts Add Contact

Test adding a new contact in the Contacts app and verifying it was saved.

## Entry Point

- App: Contacts (bundleId: `com.apple.MobileAddressBook`)
- Starting state: Contacts app is open showing the contacts list
- Device: iOS Simulator with iPhone 15

## Steps:

1. Activate Contacts app using `appium_session_management` (action=activate, id=com.apple.MobileAddressBook)
2. Ensure we're on the main contacts list by tapping back until the list is visible
3. Find and tap the "Add" button in the toolbar using accessibility id `Add`
4. Wait 2 seconds for the new contact form to appear
5. Find the "First name" text field using accessibility id and enter "John"
6. Find the "Last name" text field using accessibility id and enter "Doe"
7. Swipe up to scroll down and reveal the "add phone" section
8. Tap "add phone" to reveal the phone input field
9. Enter "555-123-4567" in the Phone field
10. Swipe up to scroll down and reveal the "add email" section
11. Tap "add email" to reveal the email input field
12. Enter "john.doe@example.com" in the Email field
13. Find and tap the "Done" button in the navigation bar to save
14. Wait 3 seconds for the contact to be saved
15. Verify the contact was saved by checking the page source contains "John" and "Doe"
16. Take a screenshot using `appium_screenshot` to capture the saved contact
17. Tap the back button to return to the contacts list

## MCP Tools to use:

- appium_session_management (activate contacts app)
- appium_find_element (accessibility id strategy)
- appium_gesture (action=tap for button taps)
- appium_set_value (enter text into form fields)
- appium_get_page_source (verify contact was saved)
- appium_screenshot (capture saved contact)
- appium_gesture (action=swipe for scrolling)

## Exit Point

- Contacts returns to the contacts list
- New contact "John Doe" was saved successfully

## Notes

- The "Add" button is in the toolbar at the bottom of the contacts list
- The new contact form has fields for First name, Last name, Company
- Phone and email fields are hidden by default - tap "add phone" and "add email" to reveal them
- The form requires scrolling to reveal all fields
- The "Done" button is in the top navigation bar (not "Save")
- Wait 2-3 seconds after each major action for transitions to complete
- The page source after saving will contain the contact's name and details
