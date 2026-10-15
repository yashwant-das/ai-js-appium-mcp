---
title: Search Contact
test: tests/search-contact.test.js
version: 1
---

# Search Contact

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Verify that a contact can be found by its full name and by its last name.

---

## Entry Point

- The Contacts app is open on the contacts list (the `beforeTest` hook guarantees this).

---

## Test Steps

1. Create a contact with generated data.
2. Return to the contacts list.
3. Search for the contact's full name.
4. Verify exactly one result.
5. Clear the search, then search for the contact's last name only.
6. Verify exactly one result.

---

## Expected Results

- Both searches return exactly the new contact.

---

## Exit Point

- The contacts list is shown; cleanup deletes the contact.

---

## Notes

- Use the existing screen methods: `ContactsListScreen.search`, `clearSearch`, `waitForContactCount`.

---

## Test Data

- Use `uniqueContact()`; register `deleteContactByName` cleanup.
