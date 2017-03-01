/* globals describe it */

const assert = require('assert');
const Manager = require('../manager');
const Query = require('../query');
const Connection = require('../connection');
const Memory = require('../adapters/memory');

describe('Manager', () => {
  describe('contructor', () => {
    it('create instance without connection when no arg specified', () => {
      let manager = new Manager();

      assert(manager instanceof Manager, 'manager instanceof Manager');

      assert.strictEqual(Object.keys(manager.pools).length, 0);
    });

    it('create instance with connection when arg connections specified', () => {
      let connections = [
        { name: 'one' },
      ];

      let manager = new Manager({ connections });

      assert.strictEqual(Object.keys(manager.pools).length, 1);

      let connection = manager.pools.one;
      assert.strictEqual(connection.name, 'one');
    });
  });

  describe('#put()', () => {
    it('add new connection', () => {
      let manager = new Manager();

      assert.strictEqual(Object.keys(manager.pools).length, 0);

      manager.putPool({ name: 'one' });

      assert.strictEqual(Object.keys(manager.pools).length, 1);
    });

    it('set main connection to connection config with truthy main property', () => {
      let manager = new Manager({
        connections: [
          { name: 'foo' },
          { name: 'bar', main: true },
        ],
      });

      assert.strictEqual(manager.main, 'bar');
    });
  });

  describe('#getPool()', () => {
    it('get main connection when no arg specified', () => {
      let manager = new Manager({
        connections: [
          { name: 'foo' },
          { name: 'bar', main: true },
        ],
      });

      assert.strictEqual(manager.getPool().name, 'bar');
    });
  });

  describe('#main', () => {
    it('value is the first connection when no default set', () => {
      it('get default connection when no arg specified', () => {
        let manager = new Manager({
          connections: [
            { name: 'foo' },
            { name: 'bar' },
          ],
        });

        assert(manager.get());
        assert.strictEqual(manager.get().name, 'foo');
      });
    });
  });

  describe('#factory()', () => {
    it('return query instance', () => {
      let manager = new Manager();

      let query = manager.factory('user');
      assert(query instanceof Query);
    });
  });
});
