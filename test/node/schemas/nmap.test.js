const assert = require('assert');
const { NMap } = require('../../../schemas');

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
});
