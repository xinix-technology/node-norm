const NField = require('./nfield');

module.exports = class NDouble extends NField {
  attach (value) {
    value = super.attach(value);
    if (value === null) {
      return null;
    }

    value = parseFloat(value);
    if (isNaN(value)) {
      throw new Error('Invalid double value');
    }

    return value;
  }

  compare (criteria, value) {
    if (value === undefined) {
      value = null;
    }

    if (criteria === value) {
      return 0;
    }

    if (criteria === null) {
      return 1;
    }

    return value - criteria;
  }
};
