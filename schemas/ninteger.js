const NField = require('./nfield');

module.exports = class NInteger extends NField {
  attach (value) {
    if (value === undefined || value === null) {
      return null;
    }

    if (value === '' || value === false) {
      return 0;
    }

    return this._parse(value);
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

  _parse (value) {
    value = parseInt(value, 10);

    if (isNaN(value)) {
      throw new Error('Invalid integer value');
    }

    return value;
  }
};
