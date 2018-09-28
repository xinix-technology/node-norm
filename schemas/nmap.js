const NField = require('./nfield');

module.exports = class NMap extends NField {
  attach (value) {
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (err) {
        return;
      }
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return;
      }

      return value;
    }
  }
};
