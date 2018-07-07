const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, { mode = 'development' }) {
  return {
    mode,
    context: __dirname,
    entry: {
      norm: './manager.js',
      'adapters/indexeddb': './adapters/indexeddb.js',
      index: './_webpack/index.js',
    },
    output: {
      path: getBasePath(),
      filename: `[name]${mode === 'development' ? '' : '.min'}.js`,
    },
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin(),
    ],
    resolve: {
      alias: {
        'node-norm': __dirname,
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: getBabelLoader(),
        },
      ],
    },
    devServer: {
      contentBase: getBasePath(),
      compress: true,
      // port: 8080,
      hot: false,
    },
  };
};

function getBabelLoader () {
  let plugins = [
    // require.resolve('babel-plugin-syntax-dynamic-import'),
    // require.resolve('babel-plugin-transform-async-to-generator'),
  ];

  let presets = [
    // [
    //   require.resolve('babel-preset-env'), {
    //     'targets': {
    //       'browsers': ['>= 5%'],
    //     },
    //   },
    // ],
  ];

  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins,
      presets,
      cacheDirectory: true,
    },
  };
}

function getBasePath () {
  return path.join(__dirname, 'dist');
}
