---
title: <Scenario Name>
test: tests/<scenario>.test.js
version: 1
---

# <Scenario Name>

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

<Brief description of what this scenario will test>

---

## Entry Point

- <Prerequisite 1, e.g., Appium server is running>
- <Prerequisite 2, e.g., Application is open on the Home Screen>

---

## Test Steps

1. <Step 1>
2. <Step 2>
3. <Step 3>

---

## Expected Results

- <Expected Outcome 1>
- <Expected Outcome 2>

---

## Exit Point

- <Final state of the application after the test>

---

## Notes

- <Any specific instructions for the AI Agent (e.g., Handle permission dialogs, prefer Accessibility IDs, avoid XPath)>

---

## Test Data

- Use `uniqueContact()` (or your app's equivalent factory in `support/testData.js`) instead of fixed names.
- Register cleanup for everything the test creates.

---

## Additional Context (Optional)

- <Information that might help the AI understand the state of the app (e.g., test data already present)>