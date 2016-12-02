'use strict';

const inspect = require('../utils/inspect');

class NField {
  constructor(name) {
    this.name = name;
    this.filters = [];
  }

  addFilter(filter) {
    filter.split('|').forEach(function(filter) {
      this.filters.push(filter);
    }.bind(this));
    return this;
  }

  inspect() {
    return inspect(this, ['name', 'filters']);
  }
}

module.exports = NField;