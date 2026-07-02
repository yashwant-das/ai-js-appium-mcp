const { expect } = require('chai');

describe('Reminders App - Create Reminder', function () {
  this.timeout(60000);

  it('should create a new reminder with title "Test reminder from Appium"', async function () {
    // Step 1: Reminders app should already be open (launched via bundleId in capabilities)
    
    // Step 2: Tap "New Reminder" button
    const newReminderBtn = await $('~New Reminder');
    await newReminderBtn.waitForDisplayed({ timeout: 10000 });
    await newReminderBtn.click();
    
    // Wait for the new reminder screen to appear
    await browser.pause(2000);
    
    // Step 3: Enter title "Test reminder from Appium"
    const titleField = await $('~Quick Entry Title Field');
    await titleField.waitForDisplayed({ timeout: 10000 });
    await titleField.setValue('Test reminder from Appium');
    
    // Wait for the text to be entered
    await browser.pause(1000);
    
    // Step 4: Tap "Done" button to save the reminder
    const doneBtn = await $('~Done');
    await doneBtn.waitForDisplayed({ timeout: 10000 });
    await doneBtn.click();
    
    // Wait for the reminder to be saved and list to update
    await browser.pause(2000);
    
    // Step 5: Verify the reminder appears in the list
    // Check that "All" or "Reminders" list shows 1 reminder
    const allRemindersBtn = await $('~All, 1 reminder');
    await allRemindersBtn.waitForDisplayed({ timeout: 10000 });
    
    const remindersListCell = await $('~Reminders, 1 reminder');
    await remindersListCell.waitForDisplayed({ timeout: 10000 });
    
    // Verify the reminder count is 1
    const reminderCount = await remindersListCell.$('~1');
    await expect(reminderCount).to.beDisplayed();
  });
});
