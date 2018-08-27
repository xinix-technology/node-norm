const { Manager } = require('../../..');
const Actorable = require('../../../observers/actorable');
const assert = require('assert');

describe('Observer: Actorable', () => {
  it('append created_by and updated_by at insert', async () => {
    let manager = createManager();

    await manager.runSession(async session => {
      let { rows } = await session.factory('foo').insert({ foo: 'bar' }).save();
      assert.strictEqual(rows[0].created_by, 'user');
      assert.strictEqual(rows[0].updated_by, 'user');
    });
  });

  it('update updated_by at update', async () => {
    let data = {
      foo: [
        { foo: 'bar' },
      ],
    };
    let manager = createManager(data);

    await manager.runSession(async session => {
      await session.factory('foo', { foo: 'bar' })
        .set({ foo: 'bar1' })
        .save();
      assert.strictEqual(data.foo[0].created_by, undefined);
      assert.strictEqual(data.foo[0].updated_by, 'user');
    });
  });

  function createManager (data) {
    return new Manager({
      connections: [
        {
          adapter: require('../../../adapters/memory'),
          data,
          schemas: [
            {
              name: 'foo',
              observers: [
                new Actorable({ userCallback: ctx => 'user' }),
              ],
            },
          ],
        },
      ],
    });
  }
});
