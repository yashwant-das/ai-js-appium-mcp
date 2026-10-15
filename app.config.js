// The app under test. Edit this file when adopting the kit for your own app.
// Any value can be overridden with APP_BUNDLE_ID, APP_PACKAGE or APP_ACTIVITY.
module.exports = {
  name: 'Contacts', // iOS Contacts and Google Contacts
  ios: {
    bundleId: 'com.apple.MobileAddressBook'
  },
  android: {
    appPackage: 'com.google.android.contacts',
    appActivity: 'com.android.contacts.activities.PeopleActivity'
  }
};
