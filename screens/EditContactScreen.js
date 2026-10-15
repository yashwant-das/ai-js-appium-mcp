const BaseScreen = require('./BaseScreen');

class EditContactScreen extends BaseScreen {
  get rootSelector() {
    // Only the edit form has a Delete Contact row, even while it is below the fold.
    return this.sel(
      { ios: "-ios predicate string:type == 'XCUIElementTypeStaticText' AND name == 'Delete Contact'" },
      'root'
    );
  }

  get phoneField() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'" },
      'phoneField'
    );
  }

  get doneButton() {
    return this.el({ ios: '~Done' }, 'doneButton');
  }

  get cancelButton() {
    return this.el({ ios: '~close' }, 'cancelButton');
  }

  get discardButton() {
    return this.el({ ios: '~Discard Changes' }, 'discardButton');
  }

  get deleteButton() {
    return this.el(
      { ios: "-ios predicate string:type == 'XCUIElementTypeStaticText' AND name == 'Delete Contact'" },
      'deleteButton'
    );
  }

  get confirmDeleteButton() {
    // The confirmation sheet reports visible="false" while it animates in.
    return this.el(
      { ios: '-ios class chain:**/XCUIElementTypeSheet/**/XCUIElementTypeButton[`name == "Delete Contact"`]' },
      'confirmDeleteButton'
    );
  }

  // isDisplayed() on the root is false while Delete Contact is below the fold,
  // so check existence instead.
  async isDisplayed() {
    return this.deleteButton.isExisting().catch(() => false);
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
    await this.scrollTo(this.deleteButton);
    await this.tap(this.deleteButton);
    await this.confirmDeleteButton.waitForExist({ timeout: 10000 });
    await this.confirmDeleteButton.click();
  }
}

module.exports = new EditContactScreen();
