const Filter = require('../filter');

class NField {
  constructor (name) {
    this.name = name;
    this.rawFilters = [];
    this.filters = [];
    this.attributes = {};
  }

  set (key, value) {
    this.attributes[key] = value;
    return this;
  }

  get (key) {
    return this.attributes[key];
  }

  filter (...filters) {
    filters.forEach(filter => {
      try {
        filter = Filter.tokenize(filter);
      } catch (err) {
        // noop
      }

      this.rawFilters.push(filter);
      this.filters.push(Filter.get(filter));
    });

    return this;
  }

  execFilter (value, { session, row, schema }) {
    // when value is string, trim first before filtering
    if (typeof value === 'string') {
      value = value.trim();
    }

    let field = this;
    return this.filters.reduce(
      async (promise, filter) => filter(await promise, { session, row, schema, field }),
      value
    );
  }

  attach (value) {
    if (value === '' || value === undefined || value === null) {
      return null;
    }

    return value;
  }

  serialize (value) {
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

    if (criteria > value) {
      return -1;
    }

    return 1;
  }

  indexOf (criteria, value) {
    return criteria.indexOf(value);
  }
}

module.exports = NField;
