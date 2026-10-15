const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveApp } = require('../support/appConfig');

const config = {
  ios: { bundleId: 'com.example.ios' },
  android: { appPackage: 'com.example.android', appActivity: '.MainActivity' }
};

test('resolves the iOS bundle ID from app.config.js', () => {
  assert.deepEqual(resolveApp('ios', {}, config), {
    platform: 'ios',
    appId: 'com.example.ios',
    bundleId: 'com.example.ios'
  });
});

test('APP_BUNDLE_ID overrides the iOS bundle ID', () => {
  assert.equal(resolveApp('ios', { APP_BUNDLE_ID: 'com.override' }, config).appId, 'com.override');
});

test('resolves Android package and activity, with env overrides', () => {
  assert.deepEqual(resolveApp('Android', { APP_ACTIVITY: '.Other' }, config), {
    platform: 'android',
    appId: 'com.example.android',
    appPackage: 'com.example.android',
    appActivity: '.Other'
  });
});

test('throws a clear error when the Android app is not configured', () => {
  assert.throws(
    () => resolveApp('android', {}, { android: { appPackage: '' } }),
    /No Android app configured: set android\.appPackage in app\.config\.js/
  );
});

test('throws a clear error when the iOS app is not configured', () => {
  assert.throws(() => resolveApp('ios', {}, {}), /No iOS app configured: set ios\.bundleId in app\.config\.js/);
});

test('rejects unknown platforms', () => {
  assert.throws(() => resolveApp('web', {}, config), /Unknown platform "web"/);
});

test('the shipped app.config.js targets iOS Contacts', () => {
  assert.equal(resolveApp('ios', {}).appId, 'com.apple.MobileAddressBook');
});

test('the shipped app.config.js targets Google Contacts on Android', () => {
  assert.deepEqual(resolveApp('android', {}), {
    platform: 'android',
    appId: 'com.google.android.contacts',
    appPackage: 'com.google.android.contacts',
    appActivity: 'com.android.contacts.activities.PeopleActivity'
  });
});
