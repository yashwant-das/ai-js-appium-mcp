---
title: Edit Contact
test: tests/edit-contact.test.js
version: 1
---

# Edit Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that changing a contact's phone number is saved and shown on the contact card.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data, including a phone number.
2. Verify the contact card shows that phone number.
3. Tap **Edit**.
4. Replace the phone number with a second generated number.
5. Tap **Done**.
6. Verify the contact card shows the new number.

---

## Expected Results

- The contact card shows the new phone number after saving.

---

## Exit Point

- The contact card is shown; cleanup deletes the contact.

---

## Notes

- iOS formats phone numbers for display; compare digits only (`ContactDetailScreen.phoneDigits`).

---

## Test Data

- Use `uniqueContact()` for the contact and `uniqueContact().phone` for the new number; register `deleteContactByName` cleanup.
