const assert = require('assert');
const { NField } = require('../../../schemas');

describe('NField', () => {
  describe('#attach()', () => {
    it('return as is', () => {
      const field = new NField();

      assert.strictEqual(field.attach('foo'), 'foo');
    });
  });

  describe('#execFilter()', () => {
    it('filter value', async () => {
      const field = new NField('foo').filter('default:zzz');
      const session = {};
      const row = {};

      assert.strictEqual(await field.execFilter(null, { session, row }), 'zzz');
      assert.strictEqual(await field.execFilter(undefined, { session, row }), 'zzz');
      assert.strictEqual(await field.execFilter('', { session, row }), 'zzz');
      assert.strictEqual(await field.execFilter('foo', { session, row }), 'foo');
    });
  });
});
