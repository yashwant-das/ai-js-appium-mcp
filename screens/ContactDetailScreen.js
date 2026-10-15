const BaseScreen = require('./BaseScreen');
const android = require('./android');

class ContactDetailScreen extends BaseScreen {
  get rootSelector() {
    return this.sel({ ios: '~ContactCardHeaderView', android: android.id('large_title') }, 'root');
  }

  get header() {
    return this.el({ ios: '~ContactCardHeaderView', android: android.id('large_title') }, 'header');
  }

  get phoneRow() {
    // iOS label: "mobile, 98765 43210". Android content-desc: "Call Mobile (987) 654-3210".
    // Formatting depends on the region, so only the digits are compared.
    return this.el(
      {
        ios: "-ios predicate string:type == 'XCUIElementTypeButton' AND name == 'ContactCardDetailsView' AND label BEGINSWITH 'mobile'",
        android: 'android=new UiSelector().descriptionStartsWith("Call Mobile")'
      },
      'phoneRow'
    );
  }

  get editButton() {
    return this.el({ ios: '~Edit', android: android.id('menu_insert_or_edit') }, 'editButton');
  }

  get backButton() {
    return this.el({ ios: '~BackButton', android: '~Navigate up' }, 'backButton');
  }

  async headerName() {
    await this.header.waitForDisplayed({ timeout: 10000 });
    return this.isIOS ? this.header.getAttribute('label') : this.header.getText();
  }

  // Digits only, so formatting such as "(987) 654-3210" does not matter.
  async phoneDigits() {
    await this.phoneRow.waitForDisplayed({ timeout: 10000 });
    const label = await this.phoneRow.getAttribute(this.isIOS ? 'label' : 'content-desc');
    return label.replace(/\D/g, '');
  }

  async tapEdit() {
    await this.tap(this.editButton);
  }

  async goBack() {
    await this.tap(this.backButton);
  }
}

module.exports = new ContactDetailScreen();
