const NField = require('./nfield');

module.exports = class NInteger extends NField {
  attach (value) {
    value = super.attach(value);
    if (value === null) {
      return null;
    }

    value = parseInt(value, 10);
    if (isNaN(value)) {
      throw new Error('Invalid integer value');
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
