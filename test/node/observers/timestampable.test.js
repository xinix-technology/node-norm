const { Manager } = require('../../..');
const Timestampable = require('../../../observers/timestampable');
const assert = require('assert');

describe('Observer: Timestampable', () => {
  it('append created_time and updated_time at insert', async () => {
    const manager = createManager();

    await manager.runSession(async session => {
      const { rows } = await session.factory('foo').insert({ foo: 'bar' }).save();
      assert(rows[0].created_time instanceof Date);
      assert(rows[0].updated_time instanceof Date);
    });
  });

  it('update updated_time at update', async () => {
    const data = {
      foo: [
        { foo: 'bar' },
      ],
    };
    const manager = createManager(data);

    await manager.runSession(async session => {
      await session.factory('foo', { foo: 'bar' })
        .set({ foo: 'bar1' })
        .save();
      assert.strictEqual(data.foo[0].created_by, undefined);
      assert(data.foo[0].updated_time instanceof Date);
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
                new Timestampable(),
              ],
            },
          ],
        },
      ],
    });
  }
});
