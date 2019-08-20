const assert = require('assert');
const { Pool, Schema } = require('../..');

describe('Pool', () => {
  describe('constructor', () => {
    it('is pool instance', () => {
      const pool = new Pool({
        adapter: require('../../adapters/memory'),
      });
      assert(pool instanceof Pool);
    });
  });

  describe('#putSchema()', () => {
    it('add new schema', () => {
      const pool = new Pool({
        adapter: require('../../adapters/memory'),
      });
      pool.putSchema({
        name: 'foo',
      });
      assert(pool.schemas.foo instanceof Schema);
    });
  });

  describe('#getSchema()', () => {
    it('return schema by its name', () => {
      const pool = new Pool({
        schemas: [
          { name: 'foo' },
        ],
        adapter: require('../../adapters/memory'),
      });
      assert(pool.getSchema('foo') instanceof Schema);
    });
  });
});
