'use strict';

const inspect = require('./utils/inspect');

class Cursor {
  constructor(collection, criteria) {
    this.collection = collection;
    this.criteria = criteria;
    this.limit = -1;
    this.skip = 0;
    this.sort = {};
  }

  fetch() {
    return this.collection.fetch(this);
  }

  first() {
    return this.fetch()
      .then(function(entries) {
        return entries[0];
      });
  }

  setLimit(limit) {
    this.limit = limit;
    return this;
  }

  setSkip(skip) {
    this.skip = skip;
    return this;
  }

  setSort(sort) {
    this.sort = sort;
    return this;
  }

  inspect() {
    return inspect(this, ['criteria', 'limit', 'skip', 'sort']);
  }
}

module.exports = Cursor;