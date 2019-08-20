const assert = require('assert');
const { NList, NInteger } = require('../../../schemas');

describe('NList', () => {
  describe('#attach()', () => {
    it('return plain array', () => {
      {
        const field = new NList();
        assert.deepStrictEqual(field.attach([1, 2]), [1, 2]);
        // assert.strictEqual(field.attach(undefined), undefined);
        assert.strictEqual(field.attach(null), null);
        assert.strictEqual(field.attach(''), null);
      }

      {
        const field = new NList().of(new NInteger());
        assert.deepStrictEqual(field.attach(['1', '2']), [1, 2]);
        assert.deepStrictEqual(field.attach(JSON.stringify(['1', '2'])), [1, 2]);
      }
    });
  });
});
