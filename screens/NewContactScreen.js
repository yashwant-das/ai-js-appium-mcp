const BaseScreen = require('./BaseScreen');

class NewContactScreen extends BaseScreen {
  get rootSelector() {
    return this.sel(
      { ios: "-ios predicate string:type == 'XCUIElementTypeNavigationBar' AND name == 'New Contact'" },
      'root'
    );
  }

  get firstName() {
    return this.el({ ios: '~First name' }, 'firstName');
  }

  get lastName() {
    return this.el({ ios: '~Last name' }, 'lastName');
  }

  get addPhoneButton() {
    return this.el({ ios: '~Insert add phone' }, 'addPhoneButton');
  }

  get phoneField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'" },
      'phoneField'
    );
  }

  get addEmailButton() {
    return this.el({ ios: '~Insert add email' }, 'addEmailButton');
  }

  get emailField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'home'" },
      'emailField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done' }, 'doneButton');
  }

  get closeButton() {
    return this.el({ ios: '~close' }, 'closeButton');
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes' }, 'discardButton');
  }

  async fill({ first, last, phone, email }) {
    await this.waitForDisplayed();
    await this.type(this.firstName, first);
    await this.type(this.lastName, last);
    if (phone) {
      await this.scrollTo(this.addPhoneButton);
      await this.tap(this.addPhoneButton);
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
