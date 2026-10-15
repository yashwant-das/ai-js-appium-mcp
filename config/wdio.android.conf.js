const { config: shared } = require('./wdio.shared.conf');
const { resolveApp } = require('../support/appConfig');

const app = resolveApp('android');

const capability = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION,
  'appium:udid': process.env.ANDROID_UDID,
  'appium:appPackage': app.appPackage,
  'appium:appActivity': app.appActivity,
  'appium:noReset': true
};

exports.config = {
  ...shared,
  capabilities: [
    Object.fromEntries(Object.entries(capability).filter(([, value]) => value))
  ]
};
