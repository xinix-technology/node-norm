const NField = require('./nfield');

module.exports = class NMap extends NField {
  attach (value) {
    if (!value) {
      return null;
    }

    try {
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        return value;
      }
    } catch (err) {
      // noop
    }

    return null;
  }
};
