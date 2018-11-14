const NField = require('./nfield');
const Big = require('big.js');

module.exports = class NBig extends NField {
  attach (value) {
    value = super.attach(value);

    if (value === null) {
      return null;
    }

    try {
      return new Big(value);
    } catch (err) {
      throw new Error('Invalid big value');
    }
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

    return new Big(value).cmp(criteria);
  }

  serialize (value) {
    if (value === null) {
      return value;
    }

    return value.toJSON();
  }
};
