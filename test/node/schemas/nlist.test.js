const assert = require('assert');
const { NList, NInteger } = require('../../../schemas');

describe('NList', () => {
  describe('#attach()', () => {
    it('return plain array', () => {
      {
        let field = new NList();
        assert.deepStrictEqual(field.attach([1, 2]), [1, 2]);
        assert.strictEqual(field.attach(undefined), undefined);
        assert.strictEqual(field.attach(null), undefined);
        assert.strictEqual(field.attach(''), undefined);
      }

      {
        let field = new NList().of(new NInteger());
        assert.deepStrictEqual(field.attach(['1', '2']), [1, 2]);
        assert.deepStrictEqual(field.attach(JSON.stringify(['1', '2'])), [1, 2]);
      }
    });
  });
});
