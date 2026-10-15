# Future Updates — ai-js-appium-mcp

Done in the starter-kit rework (2026-10): app reset before every test, `noReset` documented, scroll-before-tap, recovery from leftover app state, and an Allure report with failure artifacts.

## 1. Graceful fallback when `browser.execute()` fails

Some Appium drivers don't support WebDriver `execute/sync` for arbitrary scripts, and tests crash with `WebDriverError: Method is not implemented`. `mobile:` commands work. A wrapper that explains the difference, or falls back to a native command, would prevent confusing failures.

## 2. Android parity

Config, capabilities and locator slots for Android exist (`config/wdio.android.conf.js`, `sel({ ios, android })`); what's missing is a demo app and an Android pass.
