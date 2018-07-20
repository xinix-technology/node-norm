const Query = require('./query');
const Factory = require('async-factory');
const connectionFactory = new Factory();

let sessionNextId = 0;

class Session {
  constructor ({ manager }) {
    this.id = `session-${sessionNextId++}`;
    this.manager = manager;
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

      await this.connections[name].begin();
    }

    return this.connections[name];
  }

  async dispose () {
    await this.rollback();
    await Promise.all(Object.keys(this.connections).map(name => {
      return this.getPool(name).release(this.connections[name]);
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
}

module.exports = Session;
