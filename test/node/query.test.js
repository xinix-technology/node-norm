const { Manager } = require('../..');
const assert = require('assert');

describe('Query', () => {
  class TheObserver {
    async insert (ctx, next) {
      this.beforeInvoked = true;
      ctx.query.getInsertedRows().forEach(row => (row.added = true));
      await next();
      this.afterInvoked = true;
    }

    async delete (ctx, next) {
      this.beforeInvoked = true;
      await next();
      this.afterInvoked = true;
    }
  }

  describe('#save()', () => {
    it('run composed function of observers', async () => {
      const observer = new TheObserver();
      const data = {};
      const schemas = [
        {
          name: 'user',
          observers: [observer],
        },
      ];
      const manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
            data,
            schemas,
          },
        ],
      });

      await manager.runSession(async session => {
        const { rows } = await session.factory('user')
          .insert({ username: 'foo' })
          .save();

        assert(observer.beforeInvoked, 'Before not invoked');
        assert.strictEqual(rows[0].added, true, 'Row field not added');
        assert(observer.afterInvoked, 'After not invoked');
      });
    });
  });

  describe('#delete()', () => {
    it('run composed function of observers', async () => {
      const observer = new TheObserver();
      const data = {
        user: [{}, {}],
      };
      const schemas = [
        {
          name: 'user',
          observers: [observer],
        },
      ];
      const manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
            data,
            schemas,
          },
        ],
      });

      await manager.runSession(async session => {
        await session.factory('user').delete();

        assert(observer.beforeInvoked, 'Before not invoked');
        assert.strictEqual(data.user.length, 0);
        assert(observer.afterInvoked, 'After not invoked');
      });
    });
  });
});
