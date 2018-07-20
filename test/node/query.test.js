const { Manager } = require('../..');
const assert = require('assert');

describe('Query', () => {
  describe('#save()', () => {
    it('run composed function of observers', async () => {
      class TheObserver {
        async insert (ctx, next) {
          this.beforeInvoked = true;
          ctx.query.getInsertedRows().forEach(row => (row.added = true));
          await next();
          this.afterInvoked = true;
        }
      };

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
});
