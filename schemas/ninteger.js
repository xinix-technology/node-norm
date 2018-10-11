const NField = require('./nfield');

module.exports = class NInteger extends NField {
  attach (value) {
    value = parseInt(value, 10);

    if (isNaN(value)) {
      return null;
    }

    return value;
  }
};
