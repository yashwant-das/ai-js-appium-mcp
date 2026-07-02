exports.config = {
  runner: 'local',
  execTimeout: 120000,
  commandTimeout: 120000,
  heartbeatTimeout: 120000,
  connectionTimeout: 120000,

  frameworks: ['mocha'],
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': 'iPhone Simulator',
      'appium:platformVersion': '26.5',
      'appium:automationName': 'XCUITest',
      'appium:udid': 'E60B3481-81CA-465F-8D62-AA87C48FAF3B',
      'appium:bundleId': 'com.apple.mobilesafari',
      'appium:noReset': true,
      'appium:waitForAppScript': 'true'
    }
  ],

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  logLevel: 'warn',

  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 0,

  specLogLevels: ['error', 'warn'],
};
