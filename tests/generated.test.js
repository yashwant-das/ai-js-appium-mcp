const { describe, it } = require('mocha');
const { expect } = require('chai');
const { driver, $ } = require('@wdio/globals');

describe('Reminders App - Add New Reminder', () => {
  it('should add a new reminder', async () => {
    // Open the Reminders app
    await driver.activateApp('com.apple.reminders');

    // Tap 'New Reminder' button
    const newReminderBtn = await $('~New Reminder');
    await newReminderBtn.click();

    // Enter the reminder title
    const titleField = await $('~Title');
    await titleField.setValue('Test reminder from Appium');

    // Tap 'Done' to save the reminder
    const doneBtn = await $('~Done');
    await doneBtn.click();

    // Verify the reminder appears in the list
    const reminder = await $('=Test reminder from Appium');
    await expect(reminder).toBeDisplayed();
  });
});
