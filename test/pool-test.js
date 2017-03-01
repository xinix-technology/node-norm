/* globals describe it */

const assert = require('assert');
const Manager = require('../manager');
const Pool = require('../pool');
const Schema = require('../schema');

describe('Pool', () => {
  describe('constructor', () => {
    it('is pool instance', () => {
      let pool = new Pool({
        adapter: Manager.adapter(),
      });
      assert(pool instanceof Pool);
    });
  });

  describe('#putSchema()', () => {
    it('add new schema', () => {
      let pool = new Pool({
        adapter: Manager.adapter(),
      });
      pool.putSchema({
        name: 'foo',
      });
      assert(pool.schemas.foo instanceof Schema);
    });
  });

  describe('#getSchema()', () => {
    it('return schema by its name', () => {
      let pool = new Pool({
        schemas: [
          { name: 'foo' },
        ],
        adapter: Manager.adapter(),
      });
      assert(pool.getSchema('foo') instanceof Schema);
    });

    it('return auto schema though no schema with name as arg', () => {
      let pool = new Pool({
        adapter: Manager.adapter(),
      });
      assert(pool.getSchema('bar') instanceof Schema);
    });
  });
});
