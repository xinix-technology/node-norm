const genericPool = require('generic-pool');
const Schema = require('./schema');

let poolNextId = 0;

const kInstance = Symbol('instance');

class Pool {
  constructor (config) {
    const { name, adapter = require('./adapters/memory'), schemas = [], min = 1, max = 2 } = config;

    this.name = name || `pool-${poolNextId++}`;
    this.schemas = {};

    schemas.forEach(colOptions => this.putSchema(colOptions));

    const Adapter = adapter;

    Object.defineProperty(this, kInstance, {
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

  putSchema (schema) {
    if (schema instanceof Schema === false) {
      const { name, fields, observers, modelClass } = schema;
      schema = new Schema({ name, fields, observers, modelClass });
    }
    this.schemas[schema.name] = schema;
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
    return this[kInstance].acquire(...args);
  }

  release (...args) {
    return this[kInstance].release(...args);
  }

  drain (...args) {
    return this[kInstance].drain(...args);
  }

  clear (...args) {
    return this[kInstance].clear(...args);
  }
}

module.exports = Pool;
