const assert = require('assert');
const { NDatetime } = require('../../../schemas');

describe('NDatetime', () => {
  describe('#attach()', () => {
    it('return datetime', () => {
      const field = new NDatetime();
      const now = new Date();

      assert.strictEqual(field.attach(''), null);
      assert.strictEqual(field.attach(now.toJSON()).toJSON(), now.toJSON());
      assert.strictEqual(field.attach(now).toJSON(), now.toJSON());
      assert.strictEqual(field.attach(now.getTime()).toJSON(), now.toJSON());
    });
  });
});
