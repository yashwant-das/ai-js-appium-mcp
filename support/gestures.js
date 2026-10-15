// Taps the element if it shows up within `timeout`. Never throws.
async function tapIfVisible(element, timeout = 3000) {
  const visible = await element.waitForDisplayed({ timeout }).then(
    () => true,
    () => false
  );
  if (visible) {
    await element.click();
  }
  return visible;
}

// Swipes until the element is on screen (WebdriverIO's native-app scrollIntoView).
async function scrollTo(element, maxScrolls = 5) {
  if (await element.isDisplayed().catch(() => false)) {
    return;
  }
  await element.scrollIntoView({ maxScrolls });
}

module.exports = { tapIfVisible, scrollTo };
