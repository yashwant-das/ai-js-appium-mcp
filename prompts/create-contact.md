---
title: Create Contact
app: contacts
platform: ios
bundleId: com.apple.MobileAddressBook
version: 1
---

# Create Contact

## Objective

Create a new contact in the Contacts app and verify that it is successfully saved and displayed in the contacts list.

---

## Entry Point

- Appium server is running.
- An iOS Simulator is running.
- The Contacts app is installed.
- The Contacts app is open on the main contacts list.

---

## Test Steps

1. Open the Contacts app if it is not already active.
2. Tap the **Add** button to create a new contact.
3. Enter **John** as the first name.
4. Enter **Doe** as the last name.
5. Add the phone number **9876543210**.
6. Add the email address **john.doe@example.com**.
7. Tap **Done** to save the contact.
8. Return to the contacts list if necessary.
9. Verify that the newly created contact **John Doe** is visible in the contacts list.

---

## Expected Results

- A new contact named **John Doe** is created successfully.
- The contact details are saved correctly.
- The contact appears in the contacts list.
- No validation or application errors are displayed.

---

## Exit Point

- The Contacts app remains open.
- The contacts list is displayed.
- The newly created contact **John Doe** is visible.

---

## Notes

- Handle any permission dialogs if they appear.
- Prefer stable accessibility identifiers over XPath whenever possible.
- Wait for UI transitions only when necessary.
- Scroll if the contact is not immediately visible after saving.
- Existing contacts should not affect validation.

---

## Additional Context (Optional)

- The simulator may already contain existing contacts.
- If duplicate names exist, verify the newly created contact using the combination of name, phone number, or email address where appropriate.
- Some versions of the Contacts app may require tapping **Add Phone** or **Add Email** before entering those fields.