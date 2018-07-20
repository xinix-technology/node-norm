const assert = require('assert');
const { NField } = require('../../../schemas');

describe('NField', () => {
  describe('#attach()', () => {
    it('return as is', () => {
      let field = new NField();

      assert.strictEqual(field.attach('foo'), 'foo');
    });
  });

  describe('#doFilter()', () => {
    it('filter value', async () => {
      let field = new NField('foo', 'default:zzz');
      let session = {};
      let row = {};

      assert.strictEqual(await field.doFilter(null, { session, row }), 'zzz');
      assert.strictEqual(await field.doFilter(undefined, { session, row }), 'zzz');
      assert.strictEqual(await field.doFilter('', { session, row }), '');
      assert.strictEqual(await field.doFilter('foo', { session, row }), 'foo');
    });
  });
});
