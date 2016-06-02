'use strict';

const Collection = require('./collection');

class Repository {
  constructor() {
    this.useConnection = null;
    this.connections = {};
    this.collections = {};
  }

  addConnection(connection) {
    this.connections[connection.id] = connection;

    if (!this.useConnection) {
      this.useConnection = connection.id;
    }
  }

  getConnection(connectionId) {
    var connection = this.connections[connectionId || this.useConnection];
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    return connection;
  }

  factory(collectionId, connectionId) {
    var connection = this.getConnection(connectionId);

    var signature = `${connection.id}:${collectionId}`;
    if (!this.collections[signature]) {
      this.collections[signature] = new Collection(connection, collectionId);
    }
    return this.collections[signature];
  }
}

module.exports = Repository;