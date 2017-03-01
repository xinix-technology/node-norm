// const uuid = require('uuid');
const Query = require('./query');

let ID = 0;
function nextId () {
  // return uuid.v4();
  return ID++;
}

class Transaction {
  constructor ({ manager, autocommit = false }) {
    this.id = nextId();
    this.manager = manager;
    this.autocommit = autocommit;
    this.connections = {};
    this._locks = {};
  }

  factory (name, criteria) {
    let tx = this;
    let schema = this.getSchema(name);
    return new Query({ tx, schema, criteria });
  }

  getSchema (name) {
    let { connection, collection } = this.parseName(name);
    return this.manager.getPool(connection).getSchema(collection);
  }

  async getConnection (name) {
    let pool = this.manager.getPool(name);
    let resolvedName = pool.name;
    // console.log('t1', this.id, resolvedName, this.connections[resolvedName]);
    if (!this.connections[resolvedName]) {
      if (this._locks[resolvedName]) {
        await this._locks[resolvedName];
        if (this.connections[resolvedName]) {
          return this.connections[resolvedName];
        }
      }
      this._locks[resolvedName] = new Promise(async (resolve, reject) => {
        try {
          this.connections[resolvedName] = await pool.acquire();
          delete this._locks[resolvedName];
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      await this._locks[resolvedName];
    }
    // console.log('t2', this.id, resolvedName, this.connections[resolvedName]);
    return this.connections[resolvedName];
  }

  parseName (name) {
    let [ connection, collection ] = name.split('.');
    if (!collection) {
      collection = connection;
      connection = undefined;
    }
    return { connection, collection };
  }
}

module.exports = Transaction;
