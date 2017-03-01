const filters = {
  required () {
    return (value, field = {}) => {
      if (value === undefined || value === null) {
        throw new Error(`Field ${field.name || 'unknown'} is required`);
      }

      return value;
    };
  },

  default (defaultValue) {
    return (value, field = {}) => {
      if (value === undefined || value === null) {
        return defaultValue;
      }

      return value;
    };
  },
};

class Filter {
  static get (signature) {
    if (typeof signature === 'string') {
      signature = signature.split(':');
    }
    let [ fn, ...args ] = signature;
    if (!filters[fn]) {
      throw new Error(`Filter ${signature} not found`);
    }
    return filters[fn](...args);
  }

  static set (name, filter) {
    filters[name] = filter;
  }
}

module.exports = Filter;
