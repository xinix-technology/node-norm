const NField = require('./nfield');
const Big = require('big.js');

module.exports = class NBig extends NField {
  attach (value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    try {
      return new Big(value);
    } catch (err) {
      // noop
    }

    return null;
  }

  compare (criteria, value) {
    return this.attach(value).cmp(criteria);
  }

  serialize (value) {
    if (!value) {
      return value;
    }

    return value.toJSON();
  }
};
