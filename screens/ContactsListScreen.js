const { $$, browser } = require('@wdio/globals');
const BaseScreen = require('./BaseScreen');
const android = require('./android');

const quote = (text) => text.replace(/'/g, "\\'");

class ContactsListScreen extends BaseScreen {
  // On Android the Create contact button leaves the hierarchy while search
  // is open, so it only matches the plain list.
  get rootSelector() {
    return this.sel({ ios: '~Add', android: '~Create contact' }, 'root');
  }

  get addButton() {
    return this.el({ ios: '~Add', android: '~Create contact' }, 'addButton');
  }

  // Android only: the bar on the list that opens the search screen.
  get searchBar() {
    return this.el({ android: android.id('open_search_bar') }, 'searchBar');
  }

  get searchField() {
    return this.el(
      {
        ios: '-ios class chain:**/XCUIElementTypeSearchField',
        android: android.id('open_search_view_edit_text')
      },
      'searchField'
    );
  }

  get cancelSearchButton() {
    return this.el({ ios: '~close', android: '~Back' }, 'cancelSearchButton');
  }

  // While searching, the full list stays in the hierarchy, so only search
  // results count: visible cells on iOS, rows of the search view on Android.
  contactCellSelector(fullName) {
    return this.sel(
      {
        ios: `-ios predicate string:type == 'XCUIElementTypeCell' AND name == '${quote(fullName)}' AND visible == 1`,
        android: `android=new UiSelector().resourceId("com.google.android.contacts:id/search_compose_view").childSelector(new UiSelector().text("${fullName}"))`
      },
      'contactCell'
    );
  }

  async tapAdd() {
    await this.tap(this.addButton);
  }

  async search(text) {
    if (!this.isIOS && !(await this.searchField.isDisplayed().catch(() => false))) {
      await this.tap(this.searchBar);
    }
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
