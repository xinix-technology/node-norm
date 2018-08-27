const Filter = require('../filter');

class NField {
  constructor (name) {
    this.name = name;
    this.filters = [];
  }

  filter (...filters) {
    filters.forEach(filter => {
      this.filters.push(Filter.get(filter));
    });

    return this;
  }

  execFilter (value, { session, row }) {
    // when value is string, trim first before filtering
    if (typeof value === 'string') {
      value = value.trim();
    }

    let field = this;
    return this.filters.reduce(
      async (promise, filter) => filter(await promise, { session, row, field }),
      value
    );
  }

  attach (value) {
    return value;
  }
}

module.exports = NField;
