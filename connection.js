'use strict';

class Connection {
  static generateId() {
    Connection.generatedId = Connection.generatedId || 0;
    return `connection-${Connection.generatedId++}`;
  }

  constructor(repository, id) {
    this.repository = repository;
    this.id = id || Connection.generateId();
  }

  persist() {
    throw new Error('Please override persist');
  }

  fetch() {
    throw new Error('Please override fetch');
  }
}

module.exports = Connection;