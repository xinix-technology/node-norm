/* globals describe it */

const assert = require('assert');
const Manager = require('../manager');
const Model = require('../model');

describe('cases', () => {
  describe('single database crud', () => {
    it('insert multiple rows', async () => {
      let manager = new Manager();

      let result = await manager.factory('user')
        .insert({ username: 'admin', password: 'adminPassword' })
        .insert({ username: 'user', password: 'userPassword' })
        .save();

      assert.strictEqual(result.length, 2);
      assert(result[0] instanceof Model);

      let { data } = manager.get();

      assert(data.user);
      assert.strictEqual(data.user.length, 2);
      assert.strictEqual(data.user[0].username, 'admin');
      assert.strictEqual(data.user[1].password, 'userPassword');
    });

    it('find all rows', async () => {
      let manager = new Manager();

      await manager.factory('user')
        .insert({ username: 'admin', password: 'adminPassword' })
        .insert({ username: 'user', password: 'userPassword' })
        .save();

      let [ user1, user2 ] = await manager.factory('user').all();

      assert.strictEqual(user1.username, 'admin');
      assert.strictEqual(user2.password, 'userPassword');
    });

    it('find single row', async () => {
      let manager = new Manager();

      await manager.factory('user')
        .insert({ username: 'admin', password: 'adminPassword' })
        .insert({ username: 'user', password: 'userPassword' })
        .save();

      let user = await manager.factory('user', { username: 'user' }).single();

      assert.strictEqual(user.username, 'user');
      assert.strictEqual(user.password, 'userPassword');
    });

    it('transaction commit', async () => {
      let manager = new Manager();

      let tx = await manager.begin();

      tx.factory('user').insert({ username: 'john', password: 'doe' }).save();

      let user = await tx.factory('user').single();
      assert(user);

      let { data } = manager.get();
      assert.strictEqual(data.length, 1);

      tx.commit();
    });
  });
});
