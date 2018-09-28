const assert = require('assert');
const { NEnum } = require('../../../schemas');

describe('NEnum', () => {
  describe('#attach()', () => {
    it('validate to enum list', () => {
      let field = new NEnum().to([1, 2]);

      assert.strictEqual(field.attach(1), 1);
      assert.strictEqual(field.attach(2), 2);
      assert.strictEqual(field.attach(undefined), undefined);
      assert.strictEqual(field.attach(null), undefined);
      assert.strictEqual(field.attach(''), undefined);

      assert.strictEqual(field.attach(3), undefined);
    });
  });
});
