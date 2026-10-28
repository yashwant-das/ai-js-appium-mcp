---
title: Create Contact
test: tests/create-contact.test.js
version: 2
---

# Create Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

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
3. Enter the generated first name (`uniqueContact().first`).
4. Enter the generated last name.
5. Add the generated phone number.
6. Add the generated email address.
7. Tap **Done** to save the contact.
8. Return to the contacts list if necessary.
9. Search for the contact's full name and verify exactly one result.

---

## Expected Results

- A new contact is created successfully.
- The contact details are saved correctly.
- The contact appears in the contacts list.
- No validation or application errors are displayed.

---

## Exit Point

- The Contacts app remains open.
- The contacts list is displayed.
- The new contact is found by search.

---

## Notes

- Handle any permission dialogs if they appear.
- Prefer stable accessibility identifiers over XPath whenever possible.
- Wait for UI transitions only when necessary.
- Scroll if the contact is not immediately visible after saving.
- Existing contacts should not affect validation.

---

## Additional Context (Optional)

- Names are unique per run, so existing contacts do not affect the result.
- Some versions of the Contacts app may require tapping **Add Phone** or **Add Email** before entering those fields.
