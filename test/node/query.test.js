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
  };

  describe('#save()', () => {
    it('run composed function of observers', async () => {
      let observer = new TheObserver();
      let data = {};
      let schemas = [
        {
          name: 'user',
          observers: [ observer ],
        },
      ];
      let manager = new Manager({
        connections: [
          {
            data,
            schemas,
          },
        ],
      });

      await manager.runSession(async session => {
        let { rows } = await session.factory('user')
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
      let observer = new TheObserver();
      let data = {
        user: [ {}, {} ],
      };
      let schemas = [
        {
          name: 'user',
          observers: [ observer ],
        },
      ];
      let manager = new Manager({
        connections: [
          {
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
