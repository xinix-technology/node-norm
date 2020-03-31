const Pool = require('./pool');
const Session = require('./session');

class Manager {
  constructor ({ connections = [] } = {}) {
    this.pools = {};

    connections.forEach(connection => this.putPool(connection));
  }

  putPool (config) {
    /* istanbul ignore if */
    if (typeof config.adapter !== 'function') {
      throw new Error('Adapter must be a constructor');
    }

    const pool = new Pool(config);
    this.pools[pool.name] = pool;
    this.main = this.main || pool.name;

    return this;
  }

  /**
   * Getter pool
   *
   * @param {string} name
   * @returns {Pool}
   */
  getPool (name) {
    name = name || this.main;

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
    return new Session({ manager: this, options });
  }

  /* istanbul ignore next */
  async end () {
    await Promise.all(Object.keys(this.pools).map(async name => {
      const pool = this.pools[name];
      await pool.drain();
      await pool.clear();
    }));

    this.pools = {};
  }
}

module.exports = Manager;
