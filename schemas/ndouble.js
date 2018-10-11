const NField = require('./nfield');

module.exports = class NDouble extends NField {
  attach (value) {
    value = parseFloat(value);

    if (isNaN(value)) {
      return null;
    }

    return value;
  }
};
