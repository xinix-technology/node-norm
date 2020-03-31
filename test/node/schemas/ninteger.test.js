const assert = require('assert');
const { NInteger } = require('../../../schemas');

describe('NInteger', () => {
  describe('#attach()', () => {
    it('return integer', () => {
      const field = new NInteger();

      assert.strictEqual(field.attach(0), 0);
      assert.strictEqual(field.attach('0'), 0);
      assert.strictEqual(field.attach(undefined), null);
      assert.strictEqual(field.attach(null), null);
      assert.strictEqual(field.attach(false), 0);
      assert.strictEqual(field.attach(''), 0);
      assert.strictEqual(field.attach('1.2'), 1);
      assert.strictEqual(field.attach('100'), 100);

      assert.throws(() => field.attach('foo'));
    });
  });

  describe('#compare()', () => {
    it('compare number', () => {
      const field = new NInteger();

      assert(field.compare(10, 10) === 0);
      assert(field.compare(1, 10) > 0);
      assert(field.compare(10, 1) < 0);
      assert(field.compare(null, undefined) === 0);
      assert(field.compare(null, null) === 0);
      assert(field.compare(null, 10) > 0);
    });
  });
});
