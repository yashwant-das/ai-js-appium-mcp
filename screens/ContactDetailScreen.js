const BaseScreen = require('./BaseScreen');

class ContactDetailScreen extends BaseScreen {
  get rootSelector() {
    return this.sel({ ios: '~ContactCardHeaderView' }, 'root');
  }

  get header() {
    return this.el({ ios: '~ContactCardHeaderView' }, 'header');
  }

  get phoneRow() {
    // Label looks like "mobile, 98765 43210"; formatting depends on the region.
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeButton' AND name == 'ContactCardDetailsView' AND label BEGINSWITH 'mobile'"
      },
      'phoneRow'
    );
  }

  get editButton() {
    return this.el({ ios: '~Edit' }, 'editButton');
  }

  get backButton() {
    return this.el({ ios: '~BackButton' }, 'backButton');
  }

  async headerName() {
    await this.header.waitForDisplayed({ timeout: 10000 });
    return this.header.getAttribute('label');
  }

  // Digits only, so formatting such as "(987) 654-3210" does not matter.
  async phoneDigits() {
    await this.phoneRow.waitForDisplayed({ timeout: 10000 });
    return (await this.phoneRow.getAttribute('label')).replace(/\D/g, '');
  }

  async tapEdit() {
    await this.tap(this.editButton);
  }

  async goBack() {
    await this.tap(this.backButton);
  }
}

module.exports = new ContactDetailScreen();
