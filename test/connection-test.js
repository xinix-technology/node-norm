/* globals describe it */

const assert = require('assert');
const Connection = require('../connection');
const Schema = require('../schema');

describe('Connection', () => {
  describe('constructor', () => {
    it('is connection instance', () => {
      let connection = new Connection({});
      assert(connection instanceof Connection);
    });
  });

  describe('#put()', () => {
    it('add new schema', () => {
      let connection = new Connection({});
      connection.put({
        name: 'foo',
      });
      assert(connection.schemas.foo instanceof Schema);
    });
  });

  describe('#get()', () => {
    it('return schema by its name', () => {
      let connection = new Connection({
        schemas: [
          { name: 'foo' },
        ],
      });
      assert(connection.get('foo') instanceof Schema);
    });

    it('return auto schema though no schema with name as arg', () => {
      let connection = new Connection({});
      assert(connection.get('bar') instanceof Schema);
    });
  });
});
