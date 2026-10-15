const BaseScreen = require('./BaseScreen');
const android = require('./android');

class NewContactScreen extends BaseScreen {
  get rootSelector() {
    return this.sel(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeNavigationBar' AND name == 'New Contact'",
        android: android.text('Create contact')
      },
      'root'
    );
  }

  get firstName() {
    return this.el({ ios: '~First name', android: android.editText('First name') }, 'firstName');
  }

  get lastName() {
    return this.el({ ios: '~Last name', android: android.editText('Last name') }, 'lastName');
  }

  // iOS only: Android shows an empty phone field from the start.
  get addPhoneButton() {
    return this.el({ ios: '~Insert add phone' }, 'addPhoneButton');
  }

  get phoneField() {
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'",
        // Pre-filled with the country code.
        android: android.editText('+1')
      },
      'phoneField'
    );
  }

  get addEmailButton() {
    return this.el(
      // On Android, the Email chip under "Add more info"; finding it scrolls to it.
      { ios: '~Insert add email', android: android.scrollToText('Email') },
      'addEmailButton'
    );
  }

  get emailField() {
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'home'",
        // The new email field has no label of its own but takes focus.
        android: android.focusedEditText()
      },
      'emailField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done', android: android.text('Save') }, 'doneButton');
  }

  get closeButton() {
    return this.el({ ios: '~close', android: '~Cancel' }, 'closeButton');
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes', android: android.text('Discard') }, 'discardButton');
  }

  async fill({ first, last, phone, email }) {
    await this.waitForDisplayed();
    await this.type(this.firstName, first);
    await this.type(this.lastName, last);
    if (phone) {
      if (this.isIOS) {
        await this.scrollTo(this.addPhoneButton);
        await this.tap(this.addPhoneButton);
      }
      await this.type(this.phoneField, phone);
    }
    if (email) {
      await this.scrollTo(this.addEmailButton);
      await this.tap(this.addEmailButton);
      await this.type(this.emailField, email);
    }
  }

  async save() {
    await this.doneButton.waitForEnabled({ timeout: 10000 });
    await this.doneButton.click();
  }

  async cancelAndDiscard() {
    await this.tap(this.closeButton);
    await this.tapIfVisible(this.discardButton, 3000);
  }
}

module.exports = new NewContactScreen();
