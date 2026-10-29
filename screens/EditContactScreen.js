const { $$, browser } = require('@wdio/globals');
const BaseScreen = require('./BaseScreen');
const android = require('./android');

class EditContactScreen extends BaseScreen {
  get rootSelector() {
    // iOS: only the edit form has a Delete Contact row, even while it is below the fold.
    return this.sel(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeStaticText' AND name == 'Delete Contact'",
        android: android.text('Edit contact')
      },
      'root'
    );
  }

  get phoneField() {
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'",
        // The only field whose value starts like a phone number, e.g. "(987) 654-3210".
        android:
          'android=new UiSelector().className("android.widget.EditText").textMatches("^[+(0-9].*")'
      },
      'phoneField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done', android: android.text('Save') }, 'doneButton');
  }

  get cancelButton() {
    return this.el({ ios: '~close', android: '~Cancel' }, 'cancelButton');
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes', android: android.text('Discard') }, 'discardButton');
  }

  // iOS only: Android deletes from the toolbar menu instead.
  get deleteButton() {
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeStaticText' AND name == 'Delete Contact'"
      },
      'deleteButton'
    );
  }

  // Android only: the Delete entry in the toolbar's More options menu.
  get deleteMenuItem() {
    return this.el({ android: android.text('Delete') }, 'deleteMenuItem');
  }

  get confirmDeleteButton() {
    return this.el(
      {
        // The confirmation sheet reports visible="false" while it animates in.
        ios: '-ios class chain:**/XCUIElementTypeSheet/**/XCUIElementTypeButton[`name == "Delete Contact"`]',
        android: 'id=android:id/button1'
      },
      'confirmDeleteButton'
    );
  }

  // iOS: isDisplayed() on the root is false while Delete Contact is below the
  // fold, so check existence instead.
  async isDisplayed() {
    if (this.isIOS) {
      return this.deleteButton.isExisting().catch(() => false);
    }
    return super.isDisplayed();
  }

  async setPhone(phone) {
    await this.type(this.phoneField, phone);
  }

  async save() {
    await this.doneButton.waitForEnabled({ timeout: 10000 });
    await this.doneButton.click();
  }

  async cancelAndDiscard() {
    await this.tap(this.cancelButton);
    await this.tapIfVisible(this.discardButton, 3000);
  }

  async deleteContact() {
    if (this.isIOS) {
      await this.scrollTo(this.deleteButton);
      await this.tap(this.deleteButton);
    } else {
      // Two "More options" buttons exist (photo card and toolbar); the toolbar's is last.
      await this.waitForDisplayed();
      const menus = $$('~More options');
      await browser.waitUntil(async () => (await menus.length) > 1, {
        timeout: 10000,
        timeoutMsg: 'Edit contact menu did not appear'
      });
      await menus[(await menus.length) - 1].click();
      await this.tap(this.deleteMenuItem);
    }
    await this.confirmDeleteButton.waitForExist({ timeout: 10000 });
    await this.confirmDeleteButton.click();
  }
}

module.exports = new EditContactScreen();
