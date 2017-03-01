const Pool = require('./pool');
const Transaction = require('./transaction');

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
    this.pools = {};
    this.main = '';
    this.tx = new Transaction({ manager: this, autocommit: true });

    connections.forEach(connection => this.putPool(connection));
  }

  async initialize () {
    await Promise.all(Object.keys(this.pools).map(name => this.getPool(name).initialize()));
  }

  putPool (config) {
    config = Object.assign({ name: ':auto' }, config, { adapter: Manager.adapter(config.adapter) });

    let { main, name } = config;
    this.main = main ? name : (this.main || name);
    this.pools[name] = new Pool(config);

    return this;
  }

  getPool (name) {
    if (this.main === '') {
      this.putPool({});
    }

    name = `${name || this.main}`;

    if (!this.pools[name]) {
      throw new Error(`Pool '${name}' not found`);
    }

    return this.pools[name];
  }

  factory (name, criteria) {
    return this.tx.factory(name, criteria);
  }
}

module.exports = Manager;
