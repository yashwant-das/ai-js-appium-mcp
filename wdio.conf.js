require('dotenv').config();
const fs = require('fs');
const path = require('path');

exports.config = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',

  execTimeout: 120000,
  commandTimeout: 120000,
  heartbeatTimeout: 120000,
  connectionTimeout: 120000,

  // ====================
  // Test Configuration
  // ====================
  frameworks: ['mocha'],

  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    retries: process.env.WDIO_RETRIES ? parseInt(process.env.WDIO_RETRIES, 10) : 1
  },

  // ====================
  // Capabilities
  // ====================
  capabilities: [
    {
      platformName: process.env.APPIUM_PLATFORM || 'iOS',

      'appium:deviceName':
        process.env.APPIUM_DEVICE_NAME || 'iPhone Simulator',

      'appium:platformVersion':
        process.env.APPIUM_PLATFORM_VERSION || '26.5',

      'appium:automationName':
        process.env.APPIUM_AUTOMATION_NAME || 'XCUITest',

      'appium:udid':
        process.env.APPIUM_UDID ||
        'E60B3481-81CA-465F-8D62-AA87C48FAF3B',

      // iOS
      'appium:bundleId': process.env.APPIUM_BUNDLE_ID,

      // Android (ignored for iOS)
      'appium:appPackage': process.env.APPIUM_APP_PACKAGE,
      'appium:appActivity': process.env.APPIUM_APP_ACTIVITY,

      // Common
      'appium:noReset':
        process.env.APPIUM_NO_RESET !== 'false',

      'appium:waitForAppScript': 'true'
    }
  ],

  // ====================
  // Appium Server
  // ====================
  hostname: process.env.APPIUM_HOST || '127.0.0.1',

  port: Number(process.env.APPIUM_PORT || 4723),

  path: process.env.APPIUM_PATH || '/',

  // ====================
  // Logging
  // ====================
  logLevel: process.env.WDIO_LOG_LEVEL || 'warn',

  // ====================
  // Test Execution
  // ====================
  bail: 0,

  waitforTimeout: 10000,

  connectionRetryTimeout: 120000,

  connectionRetryCount: 0,

  specLogLevels: ['error', 'warn'],

  // ====================
  // Test Artifact Management
  // ====================
  afterTest: async function (test, context, { error }) {
    if (error) {
      const artifactDir = path.join(process.cwd(), 'test-results', 'failures');
      fs.mkdirSync(artifactDir, { recursive: true });
      const sanitizedTestName = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = Date.now();

      const screenshotPath = path.join(artifactDir, `${sanitizedTestName}_${timestamp}.png`);
      await browser.saveScreenshot(screenshotPath);

      try {
        const sourcePath = path.join(artifactDir, `${sanitizedTestName}_${timestamp}.xml`);
        const source = await browser.getPageSource();
        fs.writeFileSync(sourcePath, source);
      } catch (e) {
        console.error('Failed to capture page source:', e);
      }

      console.log(`\n📸 Captured failure screenshot: ${screenshotPath}`);
    }
  }
};