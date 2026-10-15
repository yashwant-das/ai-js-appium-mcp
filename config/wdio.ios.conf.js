const { config: shared } = require('./wdio.shared.conf');
const { resolveApp } = require('../support/appConfig');

const app = resolveApp('ios');

const capability = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone Simulator',
  'appium:platformVersion': process.env.IOS_PLATFORM_VERSION,
  'appium:udid': process.env.IOS_UDID,
  'appium:bundleId': app.bundleId,
  'appium:noReset': true
};

exports.config = {
  ...shared,
  capabilities: [
    Object.fromEntries(Object.entries(capability).filter(([, value]) => value))
  ]
};
