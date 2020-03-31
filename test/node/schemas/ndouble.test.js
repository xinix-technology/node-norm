const assert = require('assert');
const { NDouble } = require('../../../schemas');

describe('NDouble', () => {
  describe('#attach()', () => {
    it('return double', () => {
      const field = new NDouble();

      assert.strictEqual(field.attach(0), 0);
      assert.strictEqual(field.attach('0'), 0);
      assert.strictEqual(field.attach(undefined), null);
      assert.strictEqual(field.attach(null), null);
      assert.strictEqual(field.attach(false), 0);
      assert.strictEqual(field.attach(''), 0);
      assert.strictEqual(field.attach('1.2'), 1.2);
      assert.strictEqual(field.attach('100'), 100);
      assert.throws(() => field.attach('foo'));
    });
  });
});
