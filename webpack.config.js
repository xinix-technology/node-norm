const path = require('path');
const fs = require('fs');

module.exports = function (_, { mode = 'development' }) {
  return {
    mode,
    context: __dirname,
    entry: getEntries(),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `[name]${mode === 'development' ? '' : '.min'}.js`,
    },
    devtool: 'source-map',
  };
};

function getEntries () {
  const entries = {
    norm: './index.js',
    'adapters/memory': './adapters/memory.js',
    'adapters/indexeddb': './adapters/indexeddb.js',
  };

  fs.readdirSync('./observers').forEach(file => {
    const basename = path.basename(file, '.js');
    if (['hashable'].includes(basename)) {
      return;
    }

    entries[`observers/${basename}`] = `./observers/${file}`;
  });

  return entries;
}
