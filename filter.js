const filters = {
  required (value, field = {}) {
    if (value === '' || value === undefined || value === null) {
      throw new Error(`Field ${field.name || 'unknown'} is required`);
    }

    return value;
  },
};

class Filter {
  static get (name) {
    return filters[name];
  }

  static set (name, filter) {
    filters[name] = filter;
  }
}

module.exports = Filter;
