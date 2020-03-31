const { Manager, Connection } = require('../..');
const assert = require('assert');
const NString = require('../../schemas/nstring');

class TheObserver {
  async insert (ctx, next) {
    this.beforeInvoked = true;
    ctx.query.rows.forEach(row => (row.added = true));
    await next();
    this.afterInvoked = true;
  }

  async delete (ctx, next) {
    this.beforeInvoked = true;
    await next();
    this.afterInvoked = true;
  }
}

describe('Query', () => {
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

  describe('definition', () => {
    let definitions;
    let Foo;

    beforeEach(() => {
      definitions = {};
      Foo = class Foo extends Connection {
        defined ({ name }) {
          return !!definitions[name];
        }

        define (schema) {
          definitions[schema.name] = schema;
        }

        undefine (schema) {
          delete definitions[schema.name];
        }
      };
    });

    it('define and undefine specified schema', async () => {
      const manager = new Manager({
        connections: [
          {
            adapter: Foo,
            schemas: [
              {
                name: 'foo',
                fields: [
                  new NString('bar'),
                ],
              },
            ],
          },
        ],
      });

      await manager.runSession(async session => {
        assert.strictEqual(await session.factory('foo').defined(), false);
        await session.factory('foo').define();
        assert.strictEqual(await session.factory('foo').defined(), true);
        await session.factory('foo').undefine();
        assert.strictEqual(await session.factory('foo').defined(), false);
      });
    });

    it('define and undefine unspecified schema', async () => {
      const manager = new Manager({
        connections: [
          {
            adapter: Foo,
          },
        ],
      });

      await manager.runSession(async session => {
        assert.strictEqual(await session.factory('foo').defined(), false);
        await session.factory('foo').define();
        assert.strictEqual(await session.factory('foo').defined(), true);
        await session.factory('foo').undefine();
        assert.strictEqual(await session.factory('foo').defined(), false);
      });
    });
  });
});
