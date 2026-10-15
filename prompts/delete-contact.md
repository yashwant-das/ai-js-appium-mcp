---
title: Delete Contact
test: tests/delete-contact.test.js
version: 1
---

# Delete Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that a deleted contact no longer appears in search.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data.
2. Tap **Edit**.
3. Scroll to and tap **Delete Contact**, then confirm.
4. Verify the contacts list is shown.
5. Search for the contact's full name.
6. Verify there are no results.

---

## Expected Results

- The contact is deleted and search returns nothing for its name.

---

## Exit Point

- The contacts list is shown with the search active.

---

## Notes

- Still register cleanup: it does nothing if the contact is already gone, and removes it if the test fails before deleting.

---

## Test Data

- Use `uniqueContact()`; register `deleteContactByName` cleanup.
