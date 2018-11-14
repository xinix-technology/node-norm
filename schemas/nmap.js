const NField = require('./nfield');

module.exports = class NMap extends NField {
  attach (value) {
    value = super.attach(value);
    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (err) {
        throw new Error('Invalid map value');
      }
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Invalid map value');
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
