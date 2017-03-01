const genericPool = require('generic-pool');
const Schema = require('./schema');

class Pool {
  constructor (config) {
    let { name, adapter, schemas = [], min = 1, max = 1 } = config;
    this.name = name;
    this.schemas = {};

    const Adapter = adapter;
    Object.defineProperty(this, 'pool', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: genericPool.createPool({
        create () {
          // console.log('pool:create', name);
          return new Adapter(config);
        },

        destroy () {
          // console.log('pool:destroy', name);
        },
      }, { min, max }),
    });

    schemas.map(schema => this.putSchema(schema));
  }

  putSchema ({ name, fields, modelClass }) {
    let connection = this.name;
    this.schemas[name] = new Schema({ connection, name, fields, modelClass });
    return this;
  }

  getSchema (name) {
    if (!this.schemas[name]) {
      this.putSchema({ name });
    }
    return this.schemas[name];
  }

  acquire (...args) {
    // console.log(
    //   'pool:acquire',
    //   'spareResourceCapacity',
    //   this.pool.spareResourceCapacity,
    //   'size',
    //   this.pool.size,
    //   'available',
    //   this.pool.available,
    //   'borrowed',
    //   this.pool.borrowed,
    //   'pending',
    //   this.pool.pending,
    //   'max',
    //   this.pool.max,
    //   'min',
    //   this.pool.min
    // );

    return this.pool.acquire(...args);
  }

  drain (...args) {
    return this.pool.acquire(...args);
  }

  clear (...args) {
    return this.pool.clear(...args);
  }
}

module.exports = Pool;
