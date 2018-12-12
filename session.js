const Query = require('./query');
const Factory = require('async-factory');
const connectionFactory = new Factory();

let sessionNextId = 0;

class Session {
  constructor ({ manager, options = {} }) {
    this.id = `session-${sessionNextId++}`;
    this.manager = manager;
    this.connections = {};
    this.state = Object.assign({}, options.state);
  }

  factory (schema, criteria) {
    return new Query({ session: this, schema, criteria });
  }

  async acquire (name) {
    let pool = this.manager.getPool(name);

    if (!this.connections[pool.name]) {
      let id = `${this.id}-${pool.name}`;
      this.connections[pool.name] = await connectionFactory.singleton(id, () => pool.acquire());

      await this.connections[pool.name].begin();
    }

    return this.connections[pool.name];
  }

  async dispose () {
    await this.rollback();
    await Promise.all(Object.keys(this.connections).map(name => {
      return this.manager.getPool(name).release(this.connections[name]);
    }));

    this.connections = {};
  }

  close () {
    return this.commit();
  }

  async commit () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.commit();
    }));
  }

  async rollback () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.rollback();
    }));
  }

  async begin () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.begin();
    }));
  }

  async flush () {
    await this.commit();
    await this.begin();
  }

  parseSchema (name) {
    let connection;
    let schema;
    if (Array.isArray(name)) {
      if (name.length < 2) {
        throw new Error('Malformed schema name tupple');
      }
      [ connection, schema ] = name;
    } else if (name.indexOf('.') !== -1) {
      [ connection, schema ] = name.split('.');
    } else {
      connection = this.manager.getPool().name;
      schema = name;
    }

    let pool = this.manager.getPool(connection);
    return [ pool.name, pool.getSchema(schema) ];
  }
}

module.exports = Session;
