const Pool = require('./pool');
const Session = require('./session');
const Connection = require('./connection');

class Manager {
  static adapter (ctr = require(`./adapters/memory`)) {
    if (typeof ctr === 'function') {
      return ctr;
    }

    throw new Error('Adapter must be a constructor');
  }

  constructor ({ connections = [] } = {}) {
    this.pools = {};
    this.main = '';

    connections.forEach(connection => this.putPool(connection));
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

  async runSession (fn, { autocommit } = {}) {
    const session = this.openSession({ autocommit });
    try {
      const result = await fn(session);
      await session.close();
      await session.dispose();
      return result;
    } catch (err) {
      await session.dispose();
      throw err;
    }
  }

  openSession ({ autocommit } = {}) {
    return new Session({ manager: this, autocommit });
  }
}

if (typeof window !== 'undefined') {
  Manager.Connection = Connection;
  window.Norm = Manager;
}

module.exports = Manager;
