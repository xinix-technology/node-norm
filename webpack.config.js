const path = require('path');

module.exports = function (env, { mode = 'development' }) {
  return {
    mode,
    context: __dirname,
    entry: {
      norm: './index.js',
      'adapters/indexeddb': './adapters/indexeddb.js',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `[name]${mode === 'development' ? '' : '.min'}.js`,
    },
    devtool: 'source-map',
    resolve: {
      alias: {
        'node-norm': __dirname,
      },
    },
  };
};
