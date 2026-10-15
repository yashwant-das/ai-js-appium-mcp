# Roadmap

Done in the starter-kit rework (2026-10): app reset before every test, `noReset` documented, scroll-before-tap, recovery from leftover app state, and an Allure report with failure artifacts. Android support followed: the four Contacts tests run unchanged on Google Contacts (Android 17, API 37).

## 0. Verify Android and re-check iOS

Create, search and delete passed individually on Android; edit failed once after an earlier failure left the app in a bad state. Still to do: run the full Android suite twice with `WDIO_RETRIES=0`, re-run the iOS suite twice (screen objects changed for both platforms), and remove leftover `Doe-` contacts from the early Android runs.

## 1. Graceful fallback when `browser.execute()` fails

Some Appium drivers don't support WebDriver `execute/sync` for arbitrary scripts, and tests crash with `WebDriverError: Method is not implemented`. `mobile:` commands work. A wrapper that explains the difference, or falls back to a native command, would prevent confusing failures.

## Out of scope

Out of scope: a single command that runs both platforms back to back (easy to add later), and real devices or other Android versions.
