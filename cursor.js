'use strict';

class Cursor {
  constructor(collection, criteria) {
    Object.defineProperties(this, {
      collection: { enumerable: false, writable: false, configurable: false, value: collection },
      criteria: { enumerable: true, writable: true, configurable: true, value: criteria },
      limit: { enumerable: true, writable: true, configurable: true, value: -1 },
      skip: { enumerable: true, writable: true, configurable: true, value: 0 },
      sort: { enumerable: true, writable: true, configurable: true, value: {} },
    });
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
}

module.exports = Cursor;