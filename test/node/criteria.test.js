const assert = require('assert');
const { Manager } = require('../..');

describe('criteria', () => {
  it('eq', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'username!eq': 'foo' };
      const users = await session.factory('user', criteria).all();
      const [user] = users;

      assert.strictEqual(users.length, 1);
      assert.strictEqual(user.username, 'foo');
    });
  });

  it('ne', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'username!ne': 'foo' };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('gt', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!gt': 15 };
      const users = await session.factory('user', criteria).all();
      const [user] = users;

      assert.strictEqual(user.username, 'baz');
    });
  });

  it('gte', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!gte': 15 };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('lt', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!lt': 15 };
      const users = await session.factory('user', criteria).all();
      const [user] = users;

      assert.strictEqual(user.username, 'bar');
    });
  });

  it('lte', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!lte': 15 };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'bar');
    });
  });

  it('in', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!in': [14, 15] };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'bar');
    });
  });

  it('nin', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'age!nin': [14, 15] };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'baz');
    });
  });

  it('or', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = {
        '!or': [
          { username: 'foo' },
          { username: 'baz' },
        ],
      };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('and', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
        { id: 4, username: 'foo', age: 10 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = {
        '!and': [
          { username: 'foo' },
          { age: 10 },
        ],
      };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[0].age, 10);
    });
  });

  it('like', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'username!like': 'ba' };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('regex', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'username!regex': /^ba/ };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('where', async () => {
    const data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    const manager = createManager(data);
    await manager.runSession(async session => {
      const criteria = { 'username!where': (v, row) => v === 'bar' };
      const users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'bar');
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
