'use strict';

const inspect = require('./utils/inspect');

class Connection {
  static generateId() {
    Connection.generatedId = Connection.generatedId || 0;
    return `connection-${Connection.generatedId++}`;
  }

  constructor(repository, id, options) {
    this.repository = repository;
    this.id = id || Connection.generateId();
    this.options = options || {};
  }

  persist() {
    throw new Error('Please override persist');
  }

  fetch() {
    throw new Error('Please override fetch');
  }

  inspect() {
    return inspect(this, ['id']);
  }
}

module.exports = Connection;