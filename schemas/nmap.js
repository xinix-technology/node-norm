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

  compare (criteria, value) {
    let criteriaKeys = Object.getOwnPropertyNames(criteria);
    let valueKeys = Object.getOwnPropertyNames(value);

    if (criteriaKeys.length !== valueKeys.length) {
      return 1;
    }

    for (let key of criteriaKeys) {
      if (!valueKeys.includes(key)) {
        return 1;
      }

      if (criteria[key] !== value[key]) {
        return 1;
      }
    }

    return 0;
  }
};
