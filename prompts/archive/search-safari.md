---
title: Search Appium in Safari
app: safari
platform: ios
bundleId: com.apple.mobilesafari
version: 1
---

# Search Appium in Safari

> **Agent Instruction:** Before starting, read `AGENTS.md` to understand the workflow and constraints for this repository.

## Objective

Search for **"Appium"** in the Safari app and verify that the search results page loads successfully.

---

## Entry Point

- Appium server is running.
- An iOS Simulator is running.
- The Safari app is installed.
- Safari is open on its start page, a new tab, or any existing page.

---

## Test Steps

1. Open the Safari app if it is not already active.
2. Dismiss any first-launch or permission dialogs if they appear.
3. Tap the address/search bar.
4. Clear any existing text from the address bar.
5. Enter **"Appium"** into the search field.
6. Submit the search using the keyboard Search/Return button.
7. Wait for the search results page to load.
8. Verify that the search results page contains the text **"Appium"**.
9. Capture a screenshot of the search results page.

---

## Expected Results

- The search is executed successfully.
- A search results page is displayed.
- The page contains the text **"Appium"**.
- No browser or application errors are displayed.

---

## Exit Point

- Safari remains open.
- The search results page is displayed.
- A screenshot of the results page has been captured.

---

## Notes

- Handle any onboarding or permission dialogs if they appear.
- Prefer stable accessibility identifiers over XPath whenever possible.
- Wait for the page to finish loading before performing assertions.
- Use resilient element identification since Safari's UI may vary slightly across iOS versions.

---

## Additional Context (Optional)

- Safari may already contain an open webpage or previous browsing session.
- If the address bar already contains text, clear it before entering the search term.
- Depending on the default search engine, the results page may differ visually, but it should clearly contain the text **"Appium"**.
- Network connectivity is required for this scenario.
```