---
title: World Clock Add City
app: clock
version: 1
---

# World Clock Add City

Test adding a city to the World Clock in the iOS Clock app.

## Entry Point

- App: Clock (bundleId: `com.apple.Clock`)
- Starting state: Clock app is open, showing the "World Clock" tab
- Device: iOS Simulator with iPhone 15

## Steps:

1. Tap the "+" (add) button in the top right corner
2. Wait for the search/airport code screen to appear
3. Type "New" in the search field
4. Wait for search results to appear
5. Tap on "New York" from the search results
6. Wait for the city to be added to the list
7. Verify "New York" appears in the world clock list
8. Tap the "Edit" button
9. Tap the red minus button next to "New York"
10. Tap "Delete" to remove the city
11. Verify the world clock list is empty or back to original state

## MCP Tools to use:

- appium_session_management (activate clock app)
- appium_find_element (accessibility id and name strategies)
- appium_gesture (action=tap for button presses)
- appium_set_value (enter text in search field)
- appium_get_page_source (verify city added and removed)
- appium_get_element_attribute (check element states)

## Exit Point

- World clock list is empty (or back to original state)
- App returns to main World Clock view
- No pending edit mode or search screens visible

## Notes

- The "+" button has accessibility label "Add" or is located in the navigation bar
- Search field appears after tapping "+" and accepts text input
- Search results show city names with their time zone information
- The "Edit" button appears in the top right when in world clock view
- Delete confirmation requires tapping "Delete" button in a confirmation dialog
- Wait 2 seconds after each major action for UI transitions to complete
- City names in search results have accessibility labels like "New York, New York, United States"
