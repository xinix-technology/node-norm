const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = function (env = 'dev') {
  console.error('env=', env);

  return {
    context: getContext(env),
    entry: {
      norm: './manager.js',
      'adapters/indexeddb': './adapters/indexeddb.js',
      index: './_webpack/index.js',
    },
    output: {
      path: getBasePath(env),
      filename: `[name]${env === 'dev' ? '' : '.min' }.js`,
    },
    devtool: 'source-map',
    plugins: getPlugins(env),
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
          use: getBabelLoader(env),
        },
      ],
    },
    devServer: {
      contentBase: getBasePath(env),
      compress: true,
      // port: 8080,
      hot: false,
    },
  };
};

function getBabelLoader ({ mode }) {
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

function getPlugins (env) {
  let plugins = [
    new HtmlWebpackPlugin(),
  ];

  plugins.push(new webpack.optimize.CommonsChunkPlugin({
    names: ['adapters/indexeddb', 'norm'],
    minChunks: 2,
  }));

  if (env !== 'dev') {
    plugins.push(
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      })
    );
  }

  return plugins;
}

function getContext (env) {
  return path.join(__dirname);
}

function getBasePath ({ mode }) {
  return path.join(__dirname, 'dist');
}
