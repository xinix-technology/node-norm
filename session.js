const Query = require('./query');
const Factory = require('async-factory');
const connectionFactory = new Factory();

const kConnections = Symbol('connections');
let sessionNextId = 0;

class Session {
  constructor ({ manager, options = {} }) {
    this.id = `session-${sessionNextId++}`;
    this.manager = manager;
    this.state = { ...options.state };

    this[kConnections] = {};
  }

  factory (name, criteria) {
    const [connection, schema] = this.parse(name);
    return new Query({ session: this, connection, schema, criteria });
  }

  async acquire (name) {
    const pool = this.manager.getPool(name);

    if (!this[kConnections][pool.name]) {
      const id = `${this.id}-${pool.name}`;
      this[kConnections][pool.name] = await connectionFactory.singleton(id, () => pool.acquire());

      await this[kConnections][pool.name].begin();
    }

    return this[kConnections][pool.name];
  }

  async dispose () {
    await this.rollback();
    await Promise.all(Object.keys(this[kConnections]).map(name => {
      return this.manager.getPool(name).release(this[kConnections][name]);
    }));

    this[kConnections] = {};
  }

  close () {
    return this.commit();
  }

  async commit () {
    await Promise.all(Object.keys(this[kConnections]).map(async name => {
      const connection = this[kConnections][name];
      await connection.commit();
    }));
  }

  async rollback () {
    await Promise.all(Object.keys(this[kConnections]).map(async name => {
      const connection = this[kConnections][name];
      await connection.rollback();
    }));
  }

  async begin () {
    await Promise.all(Object.keys(this[kConnections]).map(async name => {
      const connection = this[kConnections][name];
      await connection.begin();
    }));
  }

  async flush () {
    await this.commit();
    await this.begin();
  }

  parse (name) {
    let connection;
    let schema;
    if (Array.isArray(name)) {
      if (name.length < 2) {
        throw new Error('Malformed schema name tupple');
      }
      [connection, schema] = name;
    } else if (name.indexOf('.') !== -1) {
      [connection, schema] = name.split('.');
    } else {
      connection = this.manager.getPool().name;
      schema = name;
    }

    const pool = this.manager.getPool(connection);
    return [pool.name, pool.getSchema(schema)];
  }
}

module.exports = Session;
