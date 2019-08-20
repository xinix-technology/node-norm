const genericPool = require('generic-pool');
const Schema = require('./schema');

let poolNextId = 0;

class Pool {
  constructor (config) {
    const { name, adapter = require('./adapters/memory'), schemas = [], min = 1, max = 2 } = config;

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
        async destroy (adapter) {
          if (adapter.end) {
            await adapter.end();
          }
        },
      }, { min, max }),
    });
  }

  putSchema ({ name, fields, observers, modelClass }) {
    const connection = this.name;
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
    return this._pool.drain(...args);
  }

  clear (...args) {
    return this._pool.clear(...args);
  }
}

module.exports = Pool;
