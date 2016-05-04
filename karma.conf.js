module.exports = function(config) {
  var options = {
    basePath: '',
    frameworks: ['mocha', 'chai', 'browserify'],
    browsers: [
      'Chrome',
      'Firefox'
    ],
    files: ['test/unit/api.js'],
    preprocessors: {
      'test/unit/api.js': 'browserify'
    },
    browserify: {
      debug: true,
      plugin: [
        'tsify',
        //'browserify-derequire',
      ],
      transform: [
        'brfs',
        //'deglobalify'
      ],
//      globalTransform: [
//        'browserify-shim'
//      ]
    },
    colors: true,
    reporters: [
      'coverage',
      'mocha',
    ],
    browserDisconnectTimeout: 60000,
    browserNoActivityTimeout: 60000,
    client: {
      mocha: {
        timeout: 59000,
      },
    },
  };

  if (process.env.CIRCLECI) {
    options.singleRun = true;
  }

  if (process.env.GROWL) {
    options.reporters.push('growl');
  }

  config.set(options);
};
