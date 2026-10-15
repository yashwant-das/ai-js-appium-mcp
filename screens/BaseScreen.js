const { $, driver } = require('@wdio/globals');
const gestures = require('../support/gestures');

class BaseScreen {
  get name() {
    return this.constructor.name;
  }

  // Selector of an element that proves this screen is showing. Override it.
  get rootSelector() {
    throw new Error(`${this.name} must define rootSelector`);
  }

  // Picks the locator for the platform under test.
  sel(locators, label) {
    const platform = driver.isIOS ? 'ios' : 'android';
    const selector = locators[platform];
    if (!selector) {
      throw new Error(`${this.name}.${label} has no ${platform} locator`);
    }
    return selector;
  }

  el(locators, label) {
    return $(this.sel(locators, label));
  }

  async waitForDisplayed(timeout = 10000) {
    await $(this.rootSelector).waitForDisplayed({ timeout });
  }

  async isDisplayed() {
    return $(this.rootSelector)
      .isDisplayed()
      .catch(() => false);
  }

  async tap(element, timeout = 10000) {
    await element.waitForDisplayed({ timeout });
    await element.click();
  }

  async type(element, text, timeout = 10000) {
    await element.waitForDisplayed({ timeout });
    await element.clearValue();
    await element.addValue(text);
  }

  tapIfVisible(element, timeout) {
    return gestures.tapIfVisible(element, timeout);
  }

  scrollTo(element) {
    return gestures.scrollTo(element);
  }
}

module.exports = BaseScreen;
