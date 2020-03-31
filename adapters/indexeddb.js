// const debug = require('debug')('node-norm:adapters:indexeddb');

/* istanbul ignore if */
if (typeof window === 'undefined') {
  throw new Error('IndexedDB adapter only works at browser');
}

const Memory = require('./memory');
const indexedDB = window.indexedDB || /* istanbul ignore next */
  window.mozIndexedDB || /* istanbul ignore next */
  window.webkitIndexedDB || /* istanbul ignore next */
  window.msIndexedDB || /* istanbul ignore next */
  window.shimIndexedDB;
// const IDBTransaction = window.IDBTransaction ||
//   window.webkitIDBTransaction ||
//   window.msIDBTransaction ||
//   { READ_WRITE: 'readwrite' };
// const IDBKeyRange = window.IDBKeyRange ||
//   window.webkitIDBKeyRange ||
//   window.msIDBKeyRange;

/* istanbul ignore if */
if (!window.indexedDB) {
  throw new Error(
    'Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.',
  );
}

/* istanbul ignore next */
const EMPTY_FN = () => {};

class IndexedDB extends Memory {
  constructor ({ name, dbname = 'db', version = 1, onUpgradeNeeded = EMPTY_FN }) {
    super({ name });

    this.dbname = dbname;
    this.version = version;
    this.onUpgradeNeeded = onUpgradeNeeded;
  }

  async load (query, callback) {
    const { criteria } = query;
    const store = await this._getStore(query.schema.name);

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

      /* istanbul ignore next */
      req.onerror = function (err) {
        reject(err);
      };
    });

    rows.forEach(row => callback(row));
  }

  async insert (query, callback) {
    const store = await this._getStore(query.schema.name);

    let inserted = 0;

    await Promise.all(query.rows.map(async row => {
      row.id = await this._promised(store.add(row));
      callback(row);
      inserted++;
    }));

    return inserted;
  }

  async update (query) {
    const rows = [];
    await this.load(query, row => rows.push(row));

    const store = await this._getStore(query.schema.name);

    // const keys = Object.keys(query.sets);
    let affected = 0;

    await Promise.all(rows.map(row => {
      // unnecessary?
      // const fieldChanges = keys.filter(key => {
      //   if (row[key] === query.sets[key]) {
      //     return false;
      //   }

      //   row[key] = query.sets[key];
      //   return true;
      // });

      // if (fieldChanges.length) {
      //   affected++;

      //   return this._promised(store.put(row));
      // }

      affected++;
      return this._promised(store.put({
        ...row,
        ...query.sets,
      }));
    }));

    return affected;
  }

  async delete (query) {
    const rows = [];
    await this.load(query, row => rows.push(row));

    const store = await this._getStore(query.schema.name);

    await rows.map(row => this._promised(store.delete(row.id)));
  }

  async truncate (query) {
    const store = await this._getStore(query.schema.name);
    await this._promised(store.clear());
  }

  drop (query) {
    return this.truncate(query);
  }

  async _getDB () {
    const req = indexedDB.open(this.dbname, this.version);
    req.onupgradeneeded = this.onUpgradeNeeded;
    const db = await this._promised(req);
    return db;
  }

  _promised (req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = evt => resolve(evt.target.result);
      req.onerror = reject;
    });
  }

  async _getTx (names) {
    const db = await this._getDB();
    return db.transaction(names, 'readwrite');
  }

  async _getStore (name) {
    const tx = await this._getTx(name);
    return tx.objectStore(name);
  }
}

/* istanbul ignore if */
if (typeof window !== 'undefined') {
  const norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.adapters = norm.adapters || {};
  norm.adapters.IndexedDB = IndexedDB;
}

module.exports = IndexedDB;
