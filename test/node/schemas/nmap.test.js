const assert = require('assert');
const { NMap } = require('../../../schemas');
const createManager = require('../_lib/create-manager');

describe('NMap', () => {
  describe('#attach()', () => {
    it('return plain object or undefined', () => {
      let field = new NMap();

      assert.deepStrictEqual(field.attach({}), {});
      // assert.strictEqual(field.attach(undefined), undefined);
      assert.strictEqual(field.attach(null), null);
      assert.strictEqual(field.attach(''), null);
      assert.deepStrictEqual(field.attach(JSON.stringify({ foo: 'bar' })), { foo: 'bar' });
    });
  });

  describe('respond to criteria', () => {
    it('respond to eq', async () => {
      let data = {
        foo: [
          {
            barMap: { name: 'bar1' },
          },
        ],
      };
      let schemas = [
        {
          name: 'foo',
          fields: [
            new NMap('barMap'),
          ],
        },
      ];

      let manager = createManager({ data, schemas });
      await manager.runSession(async session => {
        let rows = await session.factory('foo', { barMap: { name: 'bar1' } }).all();
        assert.strictEqual(rows.length, 1);
      });
    });
  });
});
