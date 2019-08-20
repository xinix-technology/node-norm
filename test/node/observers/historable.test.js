const { Manager } = require('../../..');
const Historable = require('../../../observers/historable');
const assert = require('assert');

describe('Observer: Historable', () => {
  it('append history', async () => {
    const data = {};
    const manager = createManager(data);

    await manager.runSession(async session => {
      const { rows } = await session.factory('foo').insert({ foo: 'bar' }).save();

      assert.strictEqual(data.foo_history.length, 1);

      await session.factory('foo', { id: rows[0].id }).set({ foo: 'baz' }).save();

      assert.strictEqual(data.foo_history.length, 2);

      await session.factory('foo', { id: rows[0].id }).delete();

      assert.strictEqual(data.foo_history.length, 3);
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
                new Historable(),
              ],
            },
          ],
        },
      ],
    });
  }
});
