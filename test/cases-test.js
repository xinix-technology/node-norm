/* globals describe it */

const assert = require('assert');
const Manager = require('../manager');
const Model = require('../model');

describe('cases', () => {
  describe('single database crud', () => {
    it('insert multiple rows', async () => {
      let manager = new Manager();
      let { inserted, rows } = await manager.factory('user')
        .insert({ username: 'admin', password: 'adminPassword' })
        .insert({ username: 'user', password: 'userPassword' })
        .save();

      assert.strictEqual(inserted, 2);
      assert(rows[0] instanceof Model);

      let { data } = await manager.tx.getConnection();
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

    it.skip('transaction scope', async () => {
      let manager = new Manager({
        connections: [
          { name: 'foo', max: 2 },
        ],
      });

      let tx1 = manager.begin();
      await tx1.factory('user').insert({ username: 'john', password: 'doe' }).save();

      let user = await tx1.factory('user').single();
      assert(user, 'User found from inserting transaction');

      let { data } = await tx1.getConnection();
      assert(data.user.length);

      await tx1.commit();
    });

    it.skip('show original data when not commited yet', async () => {
      let manager = new Manager({
        connections: [
          { name: 'foo', max: 2 },
        ],
      });

      let tx1 = manager.begin();
      await tx1.factory('user').insert({ username: 'john', password: 'doe' }).save();

      let user = await tx1.factory('user').single();
      assert(user, 'User found from inserting transaction');

      user = await manager.factory('user').single();
      assert(!user, 'User not found from other transaction');

      let { data } = await manager.tx.getConnection();
      assert.equal(data.user.length, 0, 'Actual data still empty');

      await tx1.commit();
    });
  });
});
