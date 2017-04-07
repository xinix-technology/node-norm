const NField = require('./nfield');

module.exports = class NBoolean extends NField {
  attach (value) {
    if (value === 'false' || value === '0' || value === '') {
      return false;
    }

    return Boolean(value);
  }
};
