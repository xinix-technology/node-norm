const { Pool, Schema } = require('../..');
const assert = require('assert');
const { NString } = require('../../schemas');

describe('Schema', () => {
  it('define schemas by pool constructor', () => {
    const pool = new Pool({
      name: 'foo',
      schemas: [
        {
          name: 'bar',
          fields: [
            new NString('baz').filter('default:baz'),
          ],
        },
      ],
    });

    assert.strictEqual(pool.getSchema('bar').name, 'bar');
    assert.strictEqual(pool.getSchema('bar').fields[0].name, 'baz');
    assert.strictEqual(pool.getSchema('bar').fields[0].filters.length, 1);
  });

  it('store attributes', () => {
    const schema = new Schema({ name: 'foo' });
    assert.strictEqual(schema.get('bar'), undefined);
    schema.set('bar', 'baz');
    assert.strictEqual(schema.get('bar'), 'baz');
  });

  it('has observers', async () => {
    const schema = new Schema({ name: 'foo' });

    const obs1 = {
      initialize () {
        this.ready = true;
      },

      uninitialize () {
        this.ready = false;
      },

      async insert (ctx, next) {
        ctx.logs.push(1);
        await next();
        ctx.logs.push(2);
      },
    };

    schema.addObserver(obs1);

    assert.strictEqual(obs1.ready, true);

    {
      const ctx = { mode: 'insert', logs: [] };
      await schema.observe(ctx, () => ctx.logs.push(3));
      assert.deepStrictEqual(ctx.logs, [1, 3, 2]);
    }

    schema.addObserver({
      async insert (ctx, next) {
        ctx.logs.push(4);
        await next();
        ctx.logs.push(5);
      },
    });

    {
      const ctx = { mode: 'insert', logs: [] };
      await schema.observe(ctx, () => ctx.logs.push(3));
      assert.deepStrictEqual(ctx.logs, [1, 4, 3, 5, 2]);
    }

    schema.removeObserver(obs1);

    assert.strictEqual(obs1.ready, false);

    {
      const ctx = { mode: 'insert', logs: [] };
      await schema.observe(ctx, () => ctx.logs.push(3));
      assert.deepStrictEqual(ctx.logs, [4, 3, 5]);
    }
  });

  describe('constructor', () => {
    it('require schema name', () => {
      assert.throws(() => new Schema({}));
    });
  });
});
