if (typeof window === 'undefined') {
  throw new Error('IndexedDB adapter only works at browser');
}

const Memory = require('./memory');
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
// const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
// const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  throw new Error(`Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.`);
}

class IndexedDB extends Memory {
  constructor ({ name, dbname = 'db', version = 1, onUpgradeNeeded = () => {} }) {
    super({ name });

    this.dbname = dbname;
    this.version = version;
    this.onUpgradeNeeded = onUpgradeNeeded;
  }

  async load (query, callback = () => {}) {
    try {
      let db = await getDB(this);
      let store = db.transaction(query.schema.name).objectStore(query.schema.name);

      let { _criteria } = query;
      // TODO: implement sorting?
      // let { _criteria, _sorts } = query;

      let rows = await new Promise((resolve, reject) => {
        let rows = [];
        let req = store.openCursor();
        req.onsuccess = evt => {
          let cursor = evt.target.result;
          if (cursor) {
            let row = cursor.value;
            if (this._matchCriteria(_criteria, row)) {
              rows.push(row);
            }
            cursor.continue();
          } else {
            resolve(rows);
          }
        };

        req.onerror = function (err) {
          reject(err);
        };
      });

      rows.forEach(row => {
        callback(row);
      });

      return rows;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async insert (query, callback = () => {}) {
    let db = await getDB(this);
    let store = db.transaction(query.schema.name, 'readwrite').objectStore(query.schema.name);

    let inserted = 0;

    await Promise.all(query._inserts.map(row => {
      return new Promise((resolve, reject) => {
        let req = store.put(row);
        req.onsuccess = function (evt) {
          row.id = evt.target.result;
          callback(row);
          inserted++;
          resolve();
        };
        req.onerror = function (err) {
          reject(err);
        };
      });
    }));

    return inserted;
  }

  async update (query) {
    let rows = await this.load(query);

    let db = await getDB(this);
    let store = db.transaction(query.schema.name, 'readwrite').objectStore(query.schema.name);

    let keys = Object.keys(query._sets);
    let affected = 0;

    await Promise.all(rows.map(row => {
      let fieldChanges = keys.filter(key => {
        if (row[key] === query._sets[key]) {
          return false;
        }

        row[key] = query._sets[key];
        return true;
      });

      if (fieldChanges.length) {
        affected++;

        return new Promise((resolve, reject) => {
          let req = store.put(row);
          req.onerror = reject;
          req.onsuccess = resolve;
        });
      }
    }));

    return affected;
  }

  async delete (query) {
    let rows = await this.load(query);

    let db = await getDB(this);
    let store = db.transaction(query.schema.name, 'readwrite').objectStore(query.schema.name);

    rows.map(row => {
      return new Promise((resolve, reject) => {
        let req = store.delete(row.id);
        req.onerror = reject;
        req.onsuccess = resolve;
      });
    });
  }
}

function getDB ({ dbname, version, onUpgradeNeeded }) {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbname, version);
    request.onupgradeneeded = onUpgradeNeeded;
    request.onsuccess = function () {
      let db = request.result;
      resolve(db);
    };
    request.onerror = function (err) {
      console.error('err', err);
      reject(err);
    };
  });
}

module.exports = IndexedDB;
