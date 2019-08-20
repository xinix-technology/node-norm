const assert = require('assert');
const FilterError = require('../../../errors/filter');

describe('FilterError', () => {
  describe('#message', () => {
    it('concatenate children message', () => {
      const err = new FilterError();
      err.add(new Error('foo'));
      err.add(new Error('bar'));

      assert.strictEqual(err.message, 'foo, bar');
    });
  });
});
