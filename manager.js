const Connection = require('./connection');

class Manager {
  constructor ({ connections = [] } = {}) {
    this.connections = connections;
    this.cachedConnections = {};
  }

  factory (name) {
    const { connection, collection } = this.extractName(name);

    return this.getConnection(connection).factory(collection);
  }

  getConnection (name) {
    if (!this.cachedConnections[name]) {
      const options = this.connections.find(connection => connection.name === name);
      this.cachedConnections[name] = Connection.create(options);
    }

    return this.cachedConnections[name];
  }

  extractName (name) {
    let [ connection, collection ] = name.split('.');
    if (!collection) {
      collection = connection;
      connection = this.connections[0].name;
    }
    return { connection, collection };
  }
}

module.exports = Manager;
