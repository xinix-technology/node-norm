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

  async doFilter (value) {
    return await this.filters.reduce(
      async (promise, filter) => await filter(await promise, this),
      Promise.resolve(value)
    );
  }
}

module.exports = NField;
