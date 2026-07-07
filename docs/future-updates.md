# Future Updates — Appium MCP Playground

## Priority 1 — Fix Immediately

### 1. Auto-reset app state for WDIO runs
The `noReset: true` default causes flaky tests when MCP sessions leave the app mid-flow. Either flip the default to `false`, or add an `afterSession` hook in `wdio.conf.js` that terminates and reinstalls the app.

**Why first:** This is the root cause of the current test failures. Low effort, high impact.

### 2. Document `APPIUM_NO_RESET` behavior
Users don't realize `noReset` persists state across WDIO runs. Add a comment in `.env.example` explaining when to toggle it.

**Why now:** Takes 2 minutes, prevents future confusion about the same issue.

---

## Priority 2 — Improve Reliability

### 3. Scroll-based locator resolution
Elements like "Insert add phone" exist in the hierarchy but are off-screen. WDIO's `$().waitForDisplayed()` doesn't auto-scroll. Adding a helper that uses `scroll_to_element` (or a swipe before waiting) would eliminate a whole class of failures.

**Why second:** Addresses the most common failure pattern seen during automation.

### 4. Graceful fallback when `browser.execute()` fails
Appium XCUITest doesn't support WebDriver `execute/sync`. Tests crash with `WebDriverError: Method is not implemented`. Wrapping JS execution in a try/catch with a native-appium fallback would prevent hard failures.

**Why third:** Small change, prevents confusing crash messages.

### 5. Session state awareness
Tests should detect whether the app is already on the target screen (e.g., New Contact form vs. contacts list) and adapt. A small `waitForAppState()` helper that checks for key elements would make tests resilient to prior MCP sessions.

**Why fourth:** Makes tests truly independent of execution order.

---

## Priority 3 — Enhance DX

### 6. Test result summary reporter
The spec reporter shows pass/fail per test but no summary of artifacts. A simple `afterSuite` hook that lists all screenshots and page sources captured would speed up debugging.

**Why later:** Nice-to-have for debugging, doesn't affect test correctness.

### 7. Android parity
Currently iOS-only in defaults. Adding Android capability support (UiAutomator2) to `wdio.conf.js` and `.env.example` would make this a true cross-platform playground.

**Why last:** Broader scope, requires testing on Android, best done after the iOS flow is solid.
