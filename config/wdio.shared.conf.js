require('dotenv').config({ quiet: true });

exports.config = {
  runner: 'local',
  specs: ['../tests/**/*.test.js'],
  maxInstances: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: process.env.WDIO_RETRIES ? Number(process.env.WDIO_RETRIES) : 1
  },

  reporters: ['spec'],

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_PATH || '/',

  logLevel: process.env.WDIO_LOG_LEVEL || 'warn',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 0
};
