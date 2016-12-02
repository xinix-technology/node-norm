'use strict';

class FilterError extends Error {
  constructor(message) {
    super(message || 'Filter errors raised');
  }
}

module.exports = FilterError;