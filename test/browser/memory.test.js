const { Manager, Model } = require('../..');
const assert = {
  strictEqual (actual, expected) {
    if (actual !== expected) {
      throw new Error(`Actual not strict equal to expected ${actual} <> ${expected}`);
    }
  },
};

describe('Memory', () => {
  describe('single database crud', () => {
    it('insert multiple rows', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        const { affected, rows } = await session.factory('user')
          .insert({ username: 'admin', password: 'adminPassword' })
          .insert({ username: 'user', password: 'userPassword' })
          .save();

        assert.strictEqual(affected, 2);
        assert.strictEqual(rows[0] instanceof Model, true);

        assert.strictEqual(!!data.user, true);
        assert.strictEqual(data.user.length, 2);
        assert.strictEqual(data.user[0].username, 'admin');
        assert.strictEqual(data.user[1].password, 'userPassword');
      });
    });

    it('update rows', async () => {
      const data = {
        foo: [
          { name: 'foo', value: 'foo1' },
          { name: 'foo', value: 'foo2' },
          { name: 'bar', value: 'bar1' },
          { name: 'bar', value: 'bar2' },
        ],
      };
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo', { name: 'foo' }).set({ value: 'fooz' }).save();

        data.foo.filter(row => row.name === 'foo').forEach(row => {
          assert.strictEqual(row.value, 'fooz');
        });
      });
    });

    it('delete rows', async () => {
      const data = {
        foo: [
          { name: 'foo', value: 'foo1' },
          { name: 'foo', value: 'foo2' },
          { name: 'bar', value: 'bar1' },
          { name: 'bar', value: 'bar2' },
        ],
      };
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo', { name: 'foo' }).delete();

        assert.strictEqual(data.foo.filter(row => row.name === 'foo').length, 0);
      });
    });

    it('truncate collection', async () => {
      const data = {
        foo: [
          { name: 'foo', value: 'foo1' },
          { name: 'foo', value: 'foo2' },
          { name: 'bar', value: 'bar1' },
          { name: 'bar', value: 'bar2' },
        ],
      };
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo').truncate();
        assert.strictEqual(data.foo.length, 0);
      });
    });

    it('drop collection', async () => {
      const data = {
        foo: [
          { name: 'foo', value: 'foo1' },
          { name: 'foo', value: 'foo2' },
          { name: 'bar', value: 'bar1' },
          { name: 'bar', value: 'bar2' },
        ],
      };
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo').drop();
        assert.strictEqual(!data.foo, true);
      });
    });

    it('find all rows', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('user')
          .insert({ username: 'admin', password: 'adminPassword' })
          .insert({ username: 'user', password: 'userPassword' })
          .save();

        const [user1, user2] = await session.factory('user').all();

        assert.strictEqual(user1.username, 'admin');
        assert.strictEqual(user2.password, 'userPassword');
      });
    });

    it('find with skip and limit', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo')
          .insert({ name: 'foo', value: 'foo1' })
          .insert({ name: 'foo', value: 'foo2' })
          .insert({ name: 'bar', value: 'bar1' })
          .insert({ name: 'bar', value: 'bar2' })
          .save();

        const foos = await session.factory('foo').skip(1).limit(1).all();

        assert.strictEqual(foos.length, 1);
        assert.strictEqual(foos[0].name, 'foo');
        assert.strictEqual(foos[0].value, 'foo2');
      });
    });

    it('find with criteria', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo')
          .insert({ name: 'foo', value: 'foo1' })
          .insert({ name: 'foo', value: 'foo2' })
          .insert({ name: 'bar', value: 'bar1' })
          .insert({ name: 'bar', value: 'bar2' })
          .save();

        const foos = await session.factory('foo', { name: 'bar' }).all();

        assert.strictEqual(foos.length, 2);
        assert.strictEqual(foos[0].name, 'bar');
        assert.strictEqual(foos[0].value, 'bar1');
      });
    });

    it('find with sort', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('foo')
          .insert({ name: 'foo', value: 'foo1' })
          .insert({ name: 'foo', value: 'foo2' })
          .insert({ name: 'bar', value: 'bar2' })
          .insert({ name: 'bar', value: 'bar1' })
          .save();

        let foos;

        foos = await session.factory('foo').sort({ name: 1 }).all();
        assert.strictEqual(foos[0].name, 'bar');

        foos = await session.factory('foo').sort({ name: -1 }).all();
        assert.strictEqual(foos[0].name, 'foo');

        foos = await session.factory('foo').sort({ name: 1 }).all();
        assert.strictEqual(foos[0].name, 'bar');

        foos = await session.factory('foo').sort({ name: 1, value: 1 }).all();
        assert.strictEqual(foos[0].name, 'bar');
        assert.strictEqual(foos[0].value, 'bar1');

        foos = await session.factory('foo').sort({ name: -1, value: 1 }).all();
        assert.strictEqual(foos[0].name, 'foo');
        assert.strictEqual(foos[0].value, 'foo1');
      });
    });

    it('find single row', async () => {
      const data = {};
      const manager = createManager(data);
      await manager.runSession(async session => {
        await session.factory('user')
          .insert({ username: 'admin', password: 'adminPassword' })
          .insert({ username: 'user', password: 'userPassword' })
          .save();

        const user = await session.factory('user', { username: 'user' }).single();

        assert.strictEqual(user.username, 'user');
        assert.strictEqual(user.password, 'userPassword');
      });
    });

    it('count all rows', async () => {
      const data = {
        user: [
          { username: 'foo', password: '1' },
          { username: 'bar', password: '2' },
          { username: 'baz', password: '1' },
        ],
      };

      const manager = createManager(data);
      await manager.runSession(async session => {
        let count = await session.factory('user').skip(1).limit(1).count();
        assert.strictEqual(count, 3);

        count = await session.factory('user', { password: '1' }).skip(1).limit(1).count();
        assert.strictEqual(count, 2);
      });
    });

    it('count respect skip and limit', async () => {
      const data = {
        user: [
          { username: 'foo', password: '1' },
          { username: 'bar', password: '2' },
          { username: 'baz', password: '1' },
        ],
      };

      const manager = createManager(data);
      await manager.runSession(async session => {
        const count = await session.factory('user').skip(1).limit(1).count(true);
        assert.strictEqual(count, 1);
      });
    });
  });

  function createManager (data) {
    return new Manager({
      connections: [
        {
          adapter: require('../../adapters/memory'),
          data,
        },
      ],
    });
  }
});
