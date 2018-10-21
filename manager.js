const Pool = require('./pool');
const Session = require('./session');

class Manager {
  static adapter (ctr) {
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
    // resolve adapter first before creating
    config.adapter = Manager.adapter(config.adapter);

    let pool = new Pool(config);
    this.pools[pool.name] = pool;
    this.main = config.main ? pool.name : (this.main || pool.name);

    return this;
  }

  /**
   * Getter pool
   *
   * @param {string} name
   * @returns {Pool}
   */
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

  async runSession (fn, options) {
    const session = this.openSession(options);
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

  openSession (options) {
    return new Session({ manager: this });
  }

  async end () {
    await Promise.all(Object.keys(this.pools).map(async name => {
      let pool = this.pools[name];
      await pool.drain();
      await pool.clear();
    }));

    this.pools = {};
  }
}

module.exports = Manager;
