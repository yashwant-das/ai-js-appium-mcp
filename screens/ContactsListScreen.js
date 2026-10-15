const { $$, browser } = require('@wdio/globals');
const BaseScreen = require('./BaseScreen');

const quote = (text) => text.replace(/'/g, "\\'");

class ContactsListScreen extends BaseScreen {
  get rootSelector() {
    return this.sel({ ios: '~Add' }, 'root');
  }

  get addButton() {
    return this.el({ ios: '~Add' }, 'addButton');
  }

  get searchField() {
    return this.el({ ios: '-ios class chain:**/XCUIElementTypeSearchField' }, 'searchField');
  }

  get cancelSearchButton() {
    return this.el({ ios: '~close' }, 'cancelSearchButton');
  }

  // While searching, the full list stays in the hierarchy as hidden cells,
  // so only visible cells count.
  contactCellSelector(fullName) {
    return this.sel(
      {
        ios: `-ios predicate string:type == 'XCUIElementTypeCell' AND name == '${quote(fullName)}' AND visible == 1`
      },
      'contactCell'
    );
  }

  async tapAdd() {
    await this.tap(this.addButton);
  }

  async search(text) {
    await this.tap(this.searchField);
    await this.type(this.searchField, text);
  }

  async clearSearch() {
    await this.tapIfVisible(this.cancelSearchButton, 1000);
  }

  async openContact(fullName) {
    const cells = $$(this.contactCellSelector(fullName));
    await browser.waitUntil(async () => (await cells.length) > 0, {
      timeout: 10000,
      timeoutMsg: `No contact cell named "${fullName}"`
    });
    await cells[0].click();
  }

  // Waits until `expected` cells match, then returns the count seen last.
  async waitForContactCount(fullName, expected, timeout = 5000) {
    const selector = this.contactCellSelector(fullName);
    let count = -1;
    await browser
      .waitUntil(
        async () => {
          count = await $$(selector).length;
          return count === expected;
        },
        { timeout, interval: 500 }
      )
      .catch(() => {});
    return count;
  }
}

module.exports = new ContactsListScreen();
