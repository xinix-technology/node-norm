const assert = require('assert');
const { Manager } = require('../..');

describe('criteria', () => {
  it('eq', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'username!eq': 'foo' };
      let users = await session.factory('user', criteria).all();
      let [ user ] = users;

      assert.strictEqual(users.length, 1);
      assert.strictEqual(user.username, 'foo');
    });
  });

  it('ne', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'username!ne': 'foo' };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('gt', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!gt': 15 };
      let users = await session.factory('user', criteria).all();
      let [ user ] = users;

      assert.strictEqual(user.username, 'baz');
    });
  });

  it('gte', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!gte': 15 };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('lt', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!lt': 15 };
      let users = await session.factory('user', criteria).all();
      let [ user ] = users;

      assert.strictEqual(user.username, 'bar');
    });
  });

  it('lte', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!lte': 15 };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'bar');
    });
  });

  it('in', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!in': [ 14, 15 ] };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'bar');
    });
  });

  it('nin', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'age!nin': [ 14, 15 ] };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'baz');
    });
  });

  it('or', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = {
        '!or': [
          { 'username': 'foo' },
          { 'username': 'baz' },
        ],
      };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('and', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
        { id: 4, username: 'foo', age: 10 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = {
        '!and': [
          { 'username': 'foo' },
          { 'age': 10 },
        ],
      };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'foo');
      assert.strictEqual(users[0].age, 10);
    });
  });

  it('like', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'username!like': 'ba' };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('regex', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'username!regex': /^ba/ };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].username, 'bar');
      assert.strictEqual(users[1].username, 'baz');
    });
  });

  it('where', async () => {
    let data = {
      user: [
        { id: 1, username: 'foo', age: 15 },
        { id: 2, username: 'bar', age: 14 },
        { id: 3, username: 'baz', age: 20 },
      ],
    };
    let manager = createManager(data);
    await manager.runSession(async session => {
      let criteria = { 'username!where': (v, row) => v === 'bar' };
      let users = await session.factory('user', criteria).all();

      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'bar');
    });
  });

  function createManager (data) {
    return new Manager({
      connections: [
        {
          data,
        },
      ],
    });
  }
});
