const assert = require('assert');
const { Filter } = require('../..');

describe('Filter', () => {
  beforeEach(() => {
    Filter.reset();
  });

  describe('#get()', () => {
    it('get default filter by string', () => {
      let filter = Filter.get('default:foo');

      assert.strictEqual(filter(null), 'foo');
      assert.strictEqual(filter(), 'foo');
      assert.strictEqual(filter(''), 'foo');
      assert.strictEqual(filter('bar'), 'bar');
    });

    it('get default filter by array', () => {
      let filter = Filter.get([ 'default', 'foo' ]);

      assert.strictEqual(filter(null), 'foo');
      assert.strictEqual(filter(), 'foo');
      assert.strictEqual(filter(''), 'foo');
      assert.strictEqual(filter('bar'), 'bar');
    });

    it('get unknown filter', () => {
      assert.throws(() => Filter.get('foo'));
    });

    it('get function filter', () => {
      let filter = Filter.get(v => 'foo');
      assert.strictEqual(filter('foo'), 'foo');
      assert.strictEqual(filter('bar'), 'foo');
    });

    it('throw err if unknown signature', () => {
      assert.throws(() => Filter.get(true));
      assert.throws(() => Filter.get(100));
      assert.throws(() => Filter.get({}));
    });
  });

  describe('#put()', () => {
    it('put new filter', () => {
      Filter.put('foo', () => {
        return val => `${val}-updated`;
      });

      let filter = Filter.get('foo');
      assert.strictEqual(filter('foo'), 'foo-updated');
    });
  });
});
