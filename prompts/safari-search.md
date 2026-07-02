---
title: Safari Search Appium
app: safari
version: 2
---

# Safari Search Appium

Test searching for "Appium" in Safari and verifying the Google search results page loads.

## Entry Point

- App: Safari (bundleId: `com.apple.mobilesafari`)
- Starting state: Safari is open with Top Sites or blank page
- Device: iOS Simulator with iPhone 15

## Steps:

1. Activate Safari app using `appium_session_management` (action=activate, name=Safari)
2. Dismiss the Safari onboarding popup if it appears ("Safari wants to use your current location") - tap "Not Now"
3. Find and tap the address/search bar using accessibility id strategy (look for element with label containing "Safari" or "Search")
4. Wait 2 seconds for the keyboard to appear
5. Clear any existing text in the address bar using `appium_set_value` with w3cActions=true
6. Type "Appium" in the address bar using `appium_set_value` with w3cActions=true
7. Tap the "Search" button on the keyboard (tap the return/search key using `appium_mobile_press_key` with key=RETURN)
8. Wait 3-5 seconds for the Google search results page to load
9. Get the page source using `appium_get_page_source` and verify it contains "Appium"
10. Take a screenshot using `appium_screenshot` to capture the search results
11. Tap the back button to return to Safari's main page
12. Wait 1 second for navigation to complete

## MCP Tools to use:

- appium_session_management (activate safari app)
- appium_find_element (accessibility id, name strategies)
- appium_gesture (action=tap for interactions)
- appium_set_value (enter search text with w3cActions=true)
- appium_get_page_source (verify search results page loaded)
- appium_screenshot (capture search results)
- appium_mobile_press_key (press RETURN key)
- appium_app_lifecycle (activate Safari)

## Exit Point

- Safari returns to the Top Sites or previous page
- Search was performed successfully
- Search results page was verified to contain "Appium"

## Notes

- Safari onboarding popup may appear on first launch - dismiss by tapping "Not Now"
- The address bar is the top element showing the current URL or "Search" placeholder
- Use `appium_set_value` with `w3cActions: true` for typing in Safari's address bar
- After searching, Google results page will load with title "Appium - Google Search"
- Wait 3-5 seconds for the page to fully load after search
- The page source will contain the Google search results HTML - search for "Appium" in it
- The back button is the system back navigation or the left arrow in Safari toolbar
- Tap back button and wait 1 second for navigation to complete
