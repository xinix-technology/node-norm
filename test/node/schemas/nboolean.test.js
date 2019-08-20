const assert = require('assert');
const { NBoolean } = require('../../../schemas');

describe('NBoolean', () => {
  describe('#attach()', () => {
    it('return boolean', () => {
      const field = new NBoolean();

      assert.strictEqual(field.attach(false), false);
      assert.strictEqual(field.attach(undefined), null);
      assert.strictEqual(field.attach(null), null);
      assert.strictEqual(field.attach(''), false);
      assert.strictEqual(field.attach('foo'), true);
      assert.strictEqual(field.attach(true), true);
    });
  });
});
