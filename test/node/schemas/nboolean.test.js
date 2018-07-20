const assert = require('assert');
const { NBoolean } = require('../../../schemas');

describe('NBoolean', () => {
  describe('#attach()', () => {
    it('return boolean', () => {
      let field = new NBoolean();

      assert.strictEqual(field.attach(false), false);
      assert.strictEqual(field.attach(undefined), false);
      assert.strictEqual(field.attach(null), false);
      assert.strictEqual(field.attach(''), false);
      assert.strictEqual(field.attach('foo'), true);
      assert.strictEqual(field.attach(true), true);
    });
  });
});
