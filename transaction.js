const uuid = require('uuid');
const Query = require('./query');
const Factory = require('async-factory');
const factory = new Factory();

function nextId () {
  return `tx-${uuid.v4()}`;
}

class Transaction {
  constructor ({ manager, autocommit = false }) {
    this.id = nextId();
    this.manager = manager;
    this.autocommit = autocommit;
    this.connections = {};
  }

  factory (name, criteria) {
    let tx = this;
    let schema = this.getSchema(name);
    return new Query({ tx, schema, criteria });
  }

  getSchema (name) {
    let { connection, schema } = this.parseName(name);
    return this.manager.getPool(connection).getSchema(schema);
  }

  async acquire (name) {
    let pool = this.manager.getPool(name);
    name = name || pool.name;

    if (!this.connections[name]) {
      let id = `tx-${this.id}-${name}`;
      let fn = () => pool.acquire();
      this.connections[name] = await factory.singleton(id, fn);
    }

    return this.connections[name];
  }

  async release () {
    await Promise.all(Object.keys(this.connections).map(name => {
      return this.manager.getPool(name).release(this.connections[name]);
    }));

    this.connections = {};
  }

  parseName (name) {
    let [ connection, schema ] = name.split('.');
    if (!schema) {
      schema = connection;
      connection = undefined;
    }
    return { connection, schema };
  }

  async rollback () {
    console.log('rollback', this.connections);

    await this.release();
  }

  async commit () {
    console.log('commit', this.connections);

    await this.release();
  }
}

module.exports = Transaction;
