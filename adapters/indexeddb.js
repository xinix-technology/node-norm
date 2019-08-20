// const debug = require('debug')('node-norm:adapters:indexeddb');

if (typeof window === 'undefined') {
  throw new Error('IndexedDB adapter only works at browser');
}

const Memory = require('./memory');
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
// const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
// const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  throw new Error('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');
}

class IndexedDB extends Memory {
  constructor ({ name, dbname = 'db', version = 1, onUpgradeNeeded = () => {} }) {
    super({ name });

    this.dbname = dbname;
    this.version = version;
    this.onUpgradeNeeded = onUpgradeNeeded;
  }

  async load (query, callback = () => {}) {
    const { criteria } = query;
    const store = await this.__getStore(query.schema.name);

    // TODO: implement sorting?
    // let { criteria, sorts } = query;

    const rows = await new Promise((resolve, reject) => {
      const rows = [];
      const req = store.openCursor();
      req.onsuccess = evt => {
        const cursor = evt.target.result;
        if (!cursor) {
          return resolve(rows);
        }

        const row = cursor.value;
        if (this._matchCriteria(criteria, row, query.schema)) {
          rows.push(row);
        }
        cursor.continue();
      };

      req.onerror = function (err) {
        reject(err);
      };
    });

    rows.forEach(row => callback(row));
  }

  async insert (query, callback = () => {}) {
    const store = await this.__getStore(query.schema.name);

    let inserted = 0;

    await Promise.all(query.rows.map(async row => {
      row.id = await this.__promised(store.add(row)); // eslint-disable-line require-atomic-updates
      callback(row);
      inserted++;
    }));

    return inserted;
  }

  async update (query) {
    const rows = [];
    await this.load(query, row => rows.push(row));

    const store = await this.__getStore(query.schema.name);

    const keys = Object.keys(query.sets);
    let affected = 0;

    await Promise.all(rows.map(row => {
      const fieldChanges = keys.filter(key => {
        if (row[key] === query.sets[key]) {
          return false;
        }

        row[key] = query.sets[key];
        return true;
      });

      if (fieldChanges.length) {
        affected++;

        return this.__promised(store.put(row));
      }
    }));

    return affected;
  }

  async delete (query) {
    const rows = [];
    await this.load(query, row => rows.push(row));

    const store = await this.__getStore(query.schema.name);

    await rows.map(row => this.__promised(store.delete(row.id)));
  }

  async truncate (query) {
    const store = await this.__getStore(query.schema.name);
    await this.__promised(store.clear());
  }

  drop (query) {
    return this.truncate(query);
  }

  async __getDB () {
    const req = indexedDB.open(this.dbname, this.version);
    req.onupgradeneeded = this.onUpgradeNeeded;
    const db = await this.__promised(req);
    return db;
  }

  __promised (req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = evt => resolve(evt.target.result);
      req.onerror = reject;
    });
  }

  async __getTx (names) {
    const db = await this.__getDB();
    return db.transaction(names, 'readwrite');
  }

  async __getStore (name) {
    const tx = await this.__getTx(name);
    return tx.objectStore(name);
  }
}

if (typeof window !== 'undefined') {
  const norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.adapters = norm.adapters || {};
  norm.adapters.IndexedDB = IndexedDB;
}

module.exports = IndexedDB;
