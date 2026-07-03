module.exports = {
  skipFiles: ['node_modules'],
  istanbulReporter: ['html', 'lcov', 'text'],
  mocha: {
    timeout: 60000
  }
};
