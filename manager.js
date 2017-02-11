class Manager {
  static adapter (name = 'memory') {
    if (typeof name === 'function') {
      return name;
    }

    if (name.indexOf('-') > -1) {
      return require(name);
    }

    return require(`./adapters/${name}`);
  }

  constructor ({ connections = [] } = {}) {
    this.connectionNames = [];
    this.connections = {};

    connections.forEach(connection => this.put(connection));
  }

  async initialize () {
    await Promise.all(this.connectionNames.map(name => this.get(name).initialize()));
  }

  put (config) {
    let { name = ':auto', adapter, main } = config;
    config = Object.assign({ name, manager: this }, config);
    let Adapter = Manager.adapter(adapter);
    let connection = new Adapter(config);

    this.main = main ? name : (this.main || name);
    this.connections[name] = connection;
    if (this.connectionNames.indexOf(name) === -1) {
      this.connectionNames.push(name);
    }

    return this;
  }

  get (name) {
    if (!name) {
      if (this.main in this.connections) {
        return this.connections[this.main];
      } else {
        return this.put({}).get();
      }
    }

    return this.connections[name];
  }

  factory (name, criteria) {
    let [ connectionName, collectionName ] = name.split('.');
    if (!collectionName) {
      collectionName = connectionName;
      connectionName = undefined;
    }

    return this.get(connectionName).factory(collectionName, criteria);
  }
}

module.exports = Manager;
