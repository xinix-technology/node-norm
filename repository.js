'use strict';

const Collection = require('./collection');
const path = require('path');
const _ = require('lodash');
const Opts = require('./utils/opts');

class Repository {
  constructor() {
    this.useConnection = null;
    this.connections = {};
    this.collections = {};
    this.resolvers = [];
  }

  addConnection(connection) {
    connection.repository = this;
    this.connections[connection.id] = connection;

    if (!this.useConnection) {
      this.useConnection = connection.id;
    }
  }

  getConnection(connectionId) {
    let connection = this.connections[connectionId || this.useConnection];
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    return connection;
  }

  getResolvers() {
    if (this.resolvers.length === 0) {
      this.resolvers.push(function(id) {
        try {
          return require(path.resolve('./config/collections', id));
        } catch(e) {}
      });
    }
    return this.resolvers;
  }

  factory(collectionId, connectionId) {
    let connection = this.getConnection(connectionId);

    let signature = `${connection.id}:${collectionId}`;
    if (!this.collections[signature]) {
      let options = new Opts({});
      this.getResolvers().some(function(resolver) {
        let resolved = resolver(collectionId);
        if (resolved) {
          options.merge(resolved);
          return true;
        }
      });

      options = options.toArray();
      let collection = this.collections[signature] = new Collection(connection, collectionId);

      if (options.fields) {
        options.fields.forEach(function(fieldOrMeta) {
          collection.addField(fieldOrMeta);
        });
      }

      if (options.observers) {
        options.observers.forEach(function(observer) {
          collection.observe(observer);
        });
      }
    }
    return this.collections[signature];
  }
}

module.exports = Repository;