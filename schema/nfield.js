const Filter = require('../filter');

class NField {
  constructor (name) {
    // this.kind = 'string'; // TODO idk whats for?
    this.name = name;
    this.filters = [];
  }

  filter (...filters) {
    filters.forEach(filter => {
      this.filters.push(Filter.get(filter));
    });

    return this;
  }

  async doFilter (value, { session, row }) {
    // when value is string, trim first before filtering
    if (typeof value === 'string') {
      value = value.trim();
    }

    let field = this;
    return await this.filters.reduce(
      async (promise, filter) => await filter(await promise, { session, row, field }),
      Promise.resolve(value)
    );
  }

  attach (value) {
    return value;
  }
}

module.exports = NField;
