const { $, driver } = require('@wdio/globals');
const { resolveApp } = require('./appConfig');
const { tapIfVisible } = require('./gestures');
const ContactsListScreen = require('../screens/ContactsListScreen');
const NewContactScreen = require('../screens/NewContactScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');

async function restartApp() {
  const { platform, appId } = resolveApp(driver.isIOS ? 'ios' : 'android');
  const args = platform === 'ios' ? { bundleId: appId } : { appId };
  await driver.execute('mobile: terminateApp', args);
  await driver.execute('mobile: activateApp', args);
}

// App-specific. When adopting the kit, replace this with whatever your app can
// be left showing after a restart (onboarding, open forms, pushed screens).
// The screen objects pick the right locators for iOS and Android.
async function dismissLeftovers() {
  if (driver.isIOS) {
    await tapIfVisible($('~Continue'), 3000); // keyboard intro on fresh simulators
  }

  // Check the overlays first: the list's Add button can still report as
  // displayed underneath a sheet.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await NewContactScreen.isDisplayed()) {
      await NewContactScreen.cancelAndDiscard();
    } else if (await EditContactScreen.isDisplayed()) {
      await EditContactScreen.cancelAndDiscard();
    } else if (await ContactDetailScreen.isDisplayed()) {
      await ContactDetailScreen.goBack();
    } else {
      break;
    }
  }

  await ContactsListScreen.clearSearch();
}

async function resetToHome() {
  await restartApp();
  await dismissLeftovers();
  await ContactsListScreen.waitForDisplayed();
}

module.exports = { restartApp, dismissLeftovers, resetToHome };
