const NInteger = require('./ninteger');

module.exports = class NDouble extends NInteger {
  _parse (value) {
    value = parseFloat(value);

    if (isNaN(value)) {
      throw new Error('Invalid double value');
    }

    return value;
  }
};
