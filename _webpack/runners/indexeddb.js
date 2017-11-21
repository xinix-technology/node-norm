const assert = require('assert');
const Manager = require('node-norm');

module.exports = async function () {
  console.group('IndexedDB runner');

  const adapter = require('node-norm/adapters/indexeddb');
  const dbname = 'db';
  const version = 1;

  function onUpgradeNeeded (evt) {
    let db = evt.target.result;
    db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
    // console.log('onUpgradeNeeded db', db);
  }

  try {
    await new Promise((resolve, reject) => {
      let req = window.indexedDB.open(dbname, version);
      req.onupgradeneeded = onUpgradeNeeded;
      req.onsuccess = function (evt) {
        let db = evt.target.result;
        let store = db.transaction('user', 'readwrite').objectStore('user');
        store.clear().onsuccess = function () {
          store.put({ username: 'foo' }).onsuccess = function () {
            store.put({ username: 'bar' }).onsuccess = function () {
              store.put({ username: 'baz' }).onsuccess = function () {
                resolve();
              };
            };
          };
        };
      };

      req.onerror = function (err) {
        reject(err);
      };
    });

    let manager = new Manager({
      connections: [
        { adapter, dbname, version, onUpgradeNeeded },
      ],
    });

    await manager.runSession(async session => {
      let users = await session.factory('user').all();
      console.info('Fixture users', users.length);
      assert.equal(users.length, 3);

      console.info('Insert new user');
      await session.factory('user').insert({ username: 'jafar' }).save();

      users = await session.factory('user').all();
      console.info('Users', users.length);
      assert.equal(users.length, 4);

      console.info('Update user');
      await session.factory('user', { username: 'bar' }).set({ age: 20 }).save();

      users = await session.factory('user').all();
      console.info('Users', users);
      assert.equal(users.find(user => user.username === 'bar').age, 20);

      console.info('Delete user');
      await session.factory('user', { username: 'baz' }).delete();

      users = await session.factory('user').all();
      console.info('Users', users);
      assert.equal(users.length, 3);
    });
  } catch (err) {
    console.error('Caught err', err);
  }

  console.groupEnd();
};
