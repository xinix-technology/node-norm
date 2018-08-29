const genericPool = require('generic-pool');
const Schema = require('./schema');

let poolNextId = 0;

class Pool {
  constructor (config) {
    let { name, adapter = require('./adapters/memory'), schemas = [], min = 1, max = 1 } = config;

    this.name = name || `pool-${poolNextId++}`;
    this.schemas = {};

    schemas.forEach(colOptions => this.putSchema(colOptions));

    const Adapter = adapter;

    Object.defineProperty(this, '_pool', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: genericPool.createPool({
        create () {
          return new Adapter(config);
        },
        destroy () {
          // noop
        },
      }, { min, max }),
    });
  }

  putSchema ({ name, fields, observers, modelClass }) {
    let connection = this.name;
    this.schemas[name] = new Schema({ connection, name, fields, observers, modelClass });
    return this;
  }

  /**
   * Getter schema
   *
   * @param {string} name
   */
  getSchema (name) {
    if (!this.schemas[name]) {
      this.putSchema({ name });
    }
    return this.schemas[name];
  }

  acquire (...args) {
    return this._pool.acquire(...args);
  }

  release (...args) {
    return this._pool.release(...args);
  }

  drain (...args) {
    return this._pool.acquire(...args);
  }

  clear (...args) {
    return this._pool.clear(...args);
  }
}

module.exports = Pool;
