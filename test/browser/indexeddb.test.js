const { Manager, Model } = require('../..');
const assert = require('assert');
// const debug = require('debug')('node-norm:test:browser:indexeddb');
// localStorage.debug = 'node-norm:*';

const IndexedDB = require('../../adapters/indexeddb');
const adapter = IndexedDB;

describe('IndexedDB', () => {
  describe('constructor', () => {
    it('has default parameters', () => {
      const conn = new IndexedDB({ name: 'idb' });
      assert.strictEqual(conn.dbname, 'db');
      assert.strictEqual(conn.version, 1);
    });
  });

  describe('single database crud', () => {
    const dbname = 'db';
    const version = 1;
    let manager;

    function onUpgradeNeeded (evt) {
      const db = evt.target.result;
      db.createObjectStore('foo', { keyPath: 'id', autoIncrement: true });
      // console.log('onUpgradeNeeded db', db);
    }

    function getDB () {
      const req = window.indexedDB.open(dbname, version);
      req.onupgradeneeded = onUpgradeNeeded;
      return promised(req);
    }

    async function getStore (name, db) {
      if (!db) {
        db = await getDB();
      }
      return db.transaction(name, 'readwrite').objectStore(name);
    }

    function promised (req) {
      return new Promise((resolve, reject) => {
        req.onsuccess = evt => resolve(evt.target.result);
        req.onerror = reject;
      });
    }

    async function getAll (name, db) {
      const store = await getStore('foo', db);
      return promised(store.getAll());
    }

    async function insert (name, row, db) {
      const store = await getStore('foo', db);
      return promised(store.add(row));
    }

    before(async () => {
      const store = await getStore('foo');
      await new Promise((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = resolve;
        req.onerror = reject;
      });

      manager = new Manager({
        connections: [
          { adapter, dbname, version, onUpgradeNeeded },
        ],
      });
    });

    it('insert multiple rows', async () => {
      await manager.runSession(async session => {
        let { affected, rows } = await session.factory('foo')
          .insert({ name: 'admin', value: 'adminPassword' })
          .insert({ name: 'foo', value: 'userPassword' })
          .save();

        assert.strictEqual(affected, 2);
        assert(rows[0] instanceof Model);

        rows = await getAll('foo');
        assert.strictEqual(rows.length, 2);
        assert.strictEqual(rows[0].name, 'admin');
        assert.strictEqual(rows[1].value, 'userPassword');
      });
    }).timeout(10000);

    it('update rows', async () => {
      await insert('foo', { name: 'foo', value: 'foo1' });

      await manager.runSession(async session => {
        await session.factory('foo', { name: 'foo' }).set({ value: 'fooz' }).save();

        const rows = await getAll('foo');
        rows.filter(row => row.name === 'foo').map(row => {
          assert.strictEqual(row.value, 'fooz');
        });
      });
    });

    it('delete rows', async () => {
      await Promise.all([
        insert('foo', { name: 'foo', value: 'foo1' }),
        insert('foo', { name: 'foo', value: 'foo2' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
      ]);

      await manager.runSession(async session => {
        await session.factory('foo', { name: 'foo' }).delete();

        const rows = await getAll('foo');
        assert.strictEqual(rows.filter(row => row.name === 'foo').length, 0);
      });
    });

    it('truncate collection', async () => {
      await Promise.all([
        insert('foo', { name: 'foo', value: 'foo1' }),
        insert('foo', { name: 'foo', value: 'foo2' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
      ]);

      await manager.runSession(async session => {
        await session.factory('foo').truncate();
        const rows = await getAll('foo');
        assert.strictEqual(rows.length, 0);
      });
    });

    it('drop collection', async () => {
      await Promise.all([
        insert('foo', { name: 'foo', value: 'foo1' }),
        insert('foo', { name: 'foo', value: 'foo2' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
        insert('foo', { name: 'bar', value: 'bar1' }),
      ]);

      await manager.runSession(async session => {
        await session.factory('foo').drop();
        const rows = await getAll('foo');
        assert.strictEqual(rows.length, 0);
      });
    });

    it('find all rows', async () => {
      await manager.runSession(async session => {
        await session.factory('foo')
          .insert({ username: 'admin', password: 'adminPassword' })
          .insert({ username: 'user', password: 'userPassword' })
          .save();

        const [user1, user2] = await session.factory('foo').all();

        assert.strictEqual(user1.username, 'admin');
        assert.strictEqual(user2.password, 'userPassword');
      });
    });
  });
});
