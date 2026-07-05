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
    timeout: 60000
  },

  // ====================
  // Capabilities
  // ====================
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': 'iPhone Simulator',
      'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '26.5',
      'appium:automationName': 'XCUITest',
      'appium:udid': process.env.APPIUM_UDID || 'E60B3481-81CA-465F-8D62-AA87C48FAF3B',
      'appium:bundleId': 'com.apple.mobilesafari',
      'appium:noReset': true,
      'appium:waitForAppScript': 'true'
    }
  ],

  // ====================
  // Remote Appium Server
  // ====================
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  // ====================
  // Level of logging verbosity
  // ====================
  logLevel: 'warn',

  // ====================
  // Test Report Configuration
  // ====================
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 0,

  // ====================
  // Spec Logging
  // ====================
  specLogLevels: ['error', 'warn'],
};
