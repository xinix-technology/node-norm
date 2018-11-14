const Manager = require('../../../manager');
const DEFAULT_ADAPTER = require('../../../adapters/memory');

module.exports = function createManager ({ adapter = DEFAULT_ADAPTER, data, schemas }) {
  return new Manager({
    connections: [
      { adapter, data, schemas },
    ],
  });
};
