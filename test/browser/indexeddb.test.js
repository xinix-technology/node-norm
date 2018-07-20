const assert = require('assert');
const { Manager, Model } = require('../..');
// const debug = require('debug')('node-norm:test:browser:indexeddb');

// localStorage.debug = 'node-norm:*';

describe('cases', () => {
  describe('single database crud', () => {
    const adapter = require('node-norm/adapters/indexeddb');
    const dbname = 'db';
    const version = 1;
    let manager;

    function onUpgradeNeeded (evt) {
      let db = evt.target.result;
      db.createObjectStore('foo', { keyPath: 'id', autoIncrement: true });
      // console.log('onUpgradeNeeded db', db);
    }

    function getDB () {
      let req = window.indexedDB.open(dbname, version);
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
      let store = await getStore('foo', db);
      return promised(store.getAll());
    }

    async function insert (name, row, db) {
      let store = await getStore('foo', db);
      return promised(store.add(row));
    }

    before(async () => {
      let store = await getStore('foo');
      await new Promise((resolve, reject) => {
        let req = store.clear();
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
        let { inserted, rows } = await session.factory('foo')
          .insert({ name: 'admin', value: 'adminPassword' })
          .insert({ name: 'foo', value: 'userPassword' })
          .save();

        assert.strictEqual(inserted, 2);
        assert(rows[0] instanceof Model);

        rows = await getAll('foo');
        assert.strictEqual(rows.length, 2);
        assert.strictEqual(rows[0].name, 'admin');
        assert.strictEqual(rows[1].value, 'userPassword');
      });
    });

    it('update rows', async () => {
      await insert('foo', { name: 'foo', value: 'foo1' });

      await manager.runSession(async session => {
        await session.factory('foo', { name: 'foo' }).set({ value: 'fooz' }).save();

        let rows = await getAll('foo');
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

        let rows = await getAll('foo');
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
        let rows = await getAll('foo');
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
        let rows = await getAll('foo');
        assert.strictEqual(rows.length, 0);
      });
    });

    it('find all rows', async () => {
      await manager.runSession(async session => {
        await session.factory('foo')
          .insert({ username: 'admin', password: 'adminPassword' })
          .insert({ username: 'user', password: 'userPassword' })
          .save();

        let [ user1, user2 ] = await session.factory('foo').all();

        assert.strictEqual(user1.username, 'admin');
        assert.strictEqual(user2.password, 'userPassword');
      });
    });
  });
});
