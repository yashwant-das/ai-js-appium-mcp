const { browser } = require('@wdio/globals');

describe('Create Contact', function () {
  // noReset keeps the app state between runs, so a previous run can leave the
  // New Contact sheet (and the keyboard intro) open. Start from the contact list.
  beforeEach(async function () {
    const bundleId = process.env.APPIUM_BUNDLE_ID;
    await browser.execute('mobile: terminateApp', { bundleId });
    await browser.execute('mobile: activateApp', { bundleId });

    const keyboardIntro = await $('~Continue');
    if (await keyboardIntro.waitForDisplayed({ timeout: 3000 }).catch(() => false)) {
      await keyboardIntro.click();
    }

    const closeButton = await $('~close');
    if (await closeButton.isDisplayed().catch(() => false)) {
      await closeButton.click();
      const discard = await $('~Discard Changes');
      if (await discard.waitForDisplayed({ timeout: 3000 }).catch(() => false)) {
        await discard.click();
      }
    }
  });

  it('should create a new contact John Doe with phone and email', async function () {
    // Step 1: Tap the Add button to create a new contact
    const addButton = await $('~Add');
    await addButton.waitForDisplayed({ timeout: 10000 });
    await addButton.click();

    // Wait for the New Contact form to appear
    await $("-ios predicate string:type == 'XCUIElementTypeNavigationBar' AND name == 'New Contact'").waitForDisplayed({ timeout: 10000 });

    // Step 2: Enter first name
    const firstNameField = await $('~First name');
    await firstNameField.waitForDisplayed({ timeout: 5000 });
    await firstNameField.clearValue();
    await firstNameField.addValue('John');

    // Step 3: Enter last name
    const lastNameField = await $('~Last name');
    await lastNameField.waitForDisplayed({ timeout: 5000 });
    await lastNameField.clearValue();
    await lastNameField.addValue('Doe');

    // Step 4: Scroll down to find "Add Phone" button, then tap it
    const addPhoneButton = await $('~Insert add phone');
    await addPhoneButton.waitForDisplayed({ timeout: 10000 });
    await addPhoneButton.click();

    // Enter phone number into the mobile field
    const phoneField = await $("-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'mobile'");
    await phoneField.waitForDisplayed({ timeout: 5000 });
    await phoneField.clearValue();
    await phoneField.addValue('9876543210');

    // Step 5: Scroll down to find "Add Email" button, then tap it
    const addEmailButton = await $('~Insert add email');
    await addEmailButton.waitForDisplayed({ timeout: 10000 });
    await addEmailButton.click();

    // Enter email address into the home field
    const emailField = await $("-ios predicate string:type == 'XCUIElementTypeTextField' AND name == 'home'");
    await emailField.waitForDisplayed({ timeout: 5000 });
    await emailField.clearValue();
    await emailField.addValue('john.doe@example.com');

    // Step 6: Tap Done to save the contact
    const doneButton = await $('~Done');
    await doneButton.waitForEnabled({ timeout: 10000 });
    await doneButton.click();

    // Wait for the contact detail page to show John Doe
    const contactHeader = await $('~ContactCardHeaderView');
    await contactHeader.waitForDisplayed({ timeout: 10000 });
    expect(await contactHeader.getAttribute('label')).toBe('John Doe');

    // Step 7: Go back to contacts list
    const backButton = await $('~BackButton');
    await backButton.waitForDisplayed({ timeout: 5000 });
    await backButton.click();

    // Step 8: Verify John Doe appears in the contacts list
    // (earlier runs may have saved the same contact, so match one or more cells)
    const johnDoeCells = $$("-ios predicate string:type == 'XCUIElementTypeCell' AND name == 'John Doe'");
    await browser.waitUntil(async () => (await johnDoeCells.length) > 0, {
      timeout: 10000,
      timeoutMsg: 'John Doe was not found in the contacts list'
    });

    // Take final screenshot
    await browser.saveScreenshot('./test-results/create_contact_success.png');
  });
});
