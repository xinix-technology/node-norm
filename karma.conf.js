const updateSnapshots = process.argv.find(arg => arg.includes('--update-snapshots'));
const pruneSnapshots = process.argv.find(arg => arg.includes('--prune-snapshots'));

process.on('uncaughtException', err => console.error('err', err));

module.exports = function (config) {
  config.set({
    frameworks: [
      'mocha',
      'snapshot',
      'mocha-snapshot',
      'source-map-support',
    ],
    files: [
      'test/browser/**/*.test.js',
    ],
    preprocessors: {
      '**/__snapshots__/**/*.md': ['snapshot'],
      'test/browser/**/*.test.js': ['webpack'],
    },
    reporters: config.coverage ? [
      'mocha',
      'coverage-istanbul',
    ] : ['mocha'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [
      'ChromeHeadlessNoSandbox',
      // 'ChromeTesting',
    ],
    singleRun: true,
    concurrency: Infinity,
    mochaReporter: { showDiff: true },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'coverage/browser',
      combineBrowserReports: true,
      skipFilesWithNoCoverage: false,
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    webpack: {
      // webpack configuration
      mode: 'development',
      // devtool: 'inline-source-map',
      module: {
        rules: config.coverage ? [
          {
            test: /adapters\/indexeddb\.js$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true },
            },
            exclude: /node_modules|\.test\.js$/,
          },
        ] : [],
      },
      // resolve: {
      //   alias: {
      //     'node-norm': path.resolve('./'),
      //   },
      // },
    },
    webpackMiddleware: {
      noInfo: true,
    },
    snapshot: {
      update: updateSnapshots,
      prune: pruneSnapshots,
      // only warn about unused snapshots when running all tests
      limitUnusedSnapshotsInWarning: config.grep ? 0 : -1,
      pathResolver (basePath, suiteName) {
        return `${basePath}/__snapshots__/${suiteName}.md`;
      },
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: { base: 'ChromeCanaryHeadless', flags: ['--no-sandbox', '--disable-setuid-sandbox'] },
      ChromeTesting: { base: 'ChromeCanary', flags: ['--no-sandbox', '--disable-setuid-sandbox'] },
    },
    plugins: [
      'karma-*',
    ],
  });
};
