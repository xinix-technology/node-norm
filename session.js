const Query = require('./query');
const Factory = require('async-factory');
const connectionFactory = new Factory();
const uuid = require('uuid');

function nextId () {
  return `session-${uuid.v4()}`;
}

class Session {
  constructor ({ manager, autocommit = true }) {
    this.id = nextId();
    this.manager = manager;
    this.autocommit = autocommit;
    this.connections = {};
  }

  getPool (...args) {
    return this.manager.getPool(...args);
  }

  getSchema (name) {
    const [ connection, schema ] = this.parseSchemaIdentifier(name);
    return this.getPool(connection).getSchema(schema);
  }

  parseSchemaIdentifier (name) {
    if (Array.isArray(name)) {
      if (name.length < 2) {
        throw new Error('Malformed schema name tupple');
      }
      return name;
    }

    if (name.indexOf('.') !== -1) {
      return name.split('.');
    }
    return [ this.getPool().name, name ];
  }

  factory (schema, criteria) {
    return new Query({ session: this, schema, criteria });
  }

  async acquire (name) {
    let pool = this.getPool(name);
    name = name || pool.name;

    if (!this.connections[name]) {
      let id = `${this.id}-${name}`;
      let fn = () => pool.acquire();
      this.connections[name] = await connectionFactory.singleton(id, fn);

      if (!this.autocommit) {
        await this.connections[name].begin();
      }
    }

    return this.connections[name];
  }

  async dispose () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      if (connection.tx) {
        await connection.rollback();
      }
      return this.getPool(name).release(connection);
    }));

    this.connections = {};
  }

  async close () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      if (connection.tx) {
        await connection.commit();
      }
    }));
  }
}

module.exports = Session;
