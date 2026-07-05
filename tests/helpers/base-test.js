/**
 * Base test helper for Reminders app tests.
 * 
 * Provides shared setup, teardown, and common locators
 * that can be imported by generated tests.
 * 
 * Usage in test:
 * const { remindersLocators, baseSetup } = require('./helpers/base-test');
 */

const { expect } = require('chai');

// Common locators for the Reminders app
const remindersLocators = {
  // Navigation
  newReminder: '~New Reminder',
  done: '~Done',
  cancel: '~Cancel',
  allReminders: '~All',
  
  // Input fields
  quickEntryTitle: '~Quick Entry Title Field',
  notes: '~Notes',
  dueDate: '~Due Date',
  priority: '~Priority',
  
  // List items
  reminderCell: '~Reminder',
  reminderList: '~Reminders',
  
  // Actions
  editButton: '~Edit',
  deleteButton: '~Delete',
  shareButton: '~Share',
};

// Custom element finder using accessibility id strategy
async function findElement(selector) {
  return $(selector);
}

// Wait for element to be displayed with timeout
async function waitForElement(selector, timeout = 10000) {
  const element = await $(selector);
  await element.waitForDisplayed({ timeout });
  return element;
}

// Tap an element by accessibility id
async function tap(selector) {
  const element = await waitForElement(selector);
  await element.click();
}

// Enter text into a field
async function enterText(selector, text) {
  const element = await waitForElement(selector);
  await element.setValue(text);
}

// Verify element is displayed
async function expectDisplayed(selector, message) {
  const element = await waitForElement(selector);
  const displayed = await element.isDisplayed();
  expect(displayed, message).to.equal(true);
}

// Base setup hook - runs before each test
async function baseSetup() {
  // Default wait timeout
  browser.setTimeout({ 'implicit': 10000 });
}

// Base teardown hook - runs after each test
async function baseTeardown() {
  // Optional: take screenshot on failure
  // if (browser.sessionId) {
  //   const screenshot = await browser.saveScreenshot('./test-results/failure.png');
  // }
}

// Navigate to a deep link
async function openDeepLink(url) {
  return await browser.url(url);
}

module.exports = {
  remindersLocators,
  findElement,
  waitForElement,
  tap,
  enterText,
  expectDisplayed,
  baseSetup,
  baseTeardown,
  openDeepLink
};
