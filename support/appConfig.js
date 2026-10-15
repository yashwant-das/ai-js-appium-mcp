const appConfig = require('../app.config');

function resolveApp(platform, env = process.env, config = appConfig) {
  const name = String(platform).toLowerCase();

  if (name === 'ios') {
    const bundleId = env.APP_BUNDLE_ID || config.ios?.bundleId;
    if (!bundleId) {
      throw new Error('No iOS app configured: set ios.bundleId in app.config.js');
    }
    return { platform: 'ios', appId: bundleId, bundleId };
  }

  if (name === 'android') {
    const appPackage = env.APP_PACKAGE || config.android?.appPackage;
    const appActivity = env.APP_ACTIVITY || config.android?.appActivity;
    if (!appPackage) {
      throw new Error('No Android app configured: set android.appPackage in app.config.js');
    }
    return { platform: 'android', appId: appPackage, appPackage, appActivity };
  }

  throw new Error(`Unknown platform "${platform}": expected "ios" or "android"`);
}

module.exports = { resolveApp };
