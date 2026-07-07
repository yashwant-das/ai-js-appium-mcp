const { browser } = require('@wdio/globals');

describe('Create Contact', function () {
  it('should create a new contact John Doe with phone and email', async function () {
    // Step 1: Tap the Add button to create a new contact
    const addButton = await $('~Add');
    await addButton.waitForDisplayed({ timeout: 10000 });
    await addButton.click();

    // Wait for the New Contact form to appear
    await $('~New Contact').waitForDisplayed({ timeout: 10000 });

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
    await $('~Insert add phone').waitForDisplayed({ timeout: 10000 });
    await browser.pause(500);
    const addPhoneButton = await $('~Insert add phone');
    await addPhoneButton.click();

    // Enter phone number into the mobile field
    const phoneField = await $('~mobile');
    await phoneField.waitForDisplayed({ timeout: 5000 });
    await phoneField.clearValue();
    await phoneField.addValue('9876543210');

    // Step 5: Scroll down to find "Add Email" button, then tap it
    await browser.pause(500);
    const addEmailButton = await $('~Insert add email');
    await addEmailButton.click();

    // Enter email address into the home field
    const emailField = await $('~home');
    await emailField.waitForDisplayed({ timeout: 5000 });
    await emailField.clearValue();
    await emailField.addValue('john.doe@example.com');

    // Step 6: Tap Done to save the contact
    const doneButton = await $('~Done');
    await doneButton.waitForEnabled({ timeout: 10000 });
    await doneButton.click();

    // Wait for the contact detail page to show John Doe
    await $('~John Doe').waitForDisplayed({ timeout: 10000 });

    // Step 7: Go back to contacts list
    const backButton = await $('~BackButton');
    await backButton.waitForDisplayed({ timeout: 5000 });
    await backButton.click();

    // Step 8: Verify John Doe appears in the contacts list
    await $('~John Doe').waitForDisplayed({ timeout: 10000 });

    // Take final screenshot
    await browser.saveScreenshot('./test-results/create_contact_success.png');
  });
});
