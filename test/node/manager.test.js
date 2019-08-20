const assert = require('assert');
const { Manager } = require('../..');
const Memory = require('../../adapters/memory');

describe('Manager', () => {
  describe('.adapter()', () => {
    it('validate adapter', () => {
      let Adapter;

      assert.throws(() => Manager.adapter());

      Adapter = Manager.adapter(Memory);
      assert.strictEqual(Adapter, Memory);

      assert.throws(() => Manager.adapter('other-adapter'));

      class Foo {}
      Adapter = Manager.adapter(Foo);
      assert.strictEqual(Adapter, Foo);
    });
  });

  describe('contructor', () => {
    it('create instance without connection when no arg specified', () => {
      const manager = new Manager();

      assert(manager instanceof Manager, 'manager instanceof Manager');

      assert.strictEqual(Object.keys(manager.pools).length, 0);
    });

    it('create instance with connection when arg connections specified', () => {
      const connections = [
        { name: 'one', adapter: require('../../adapters/memory') },
      ];

      const manager = new Manager({ connections });

      assert.strictEqual(Object.keys(manager.pools).length, 1);

      const connection = manager.pools.one;
      assert.strictEqual(connection.name, 'one');
    });
  });

  describe('#put()', () => {
    it('add new connection', () => {
      const manager = new Manager();

      assert.strictEqual(Object.keys(manager.pools).length, 0);

      manager.putPool({ name: 'one', adapter: require('../../adapters/memory') });

      assert.strictEqual(Object.keys(manager.pools).length, 1);
    });

    it('set main connection to connection config with truthy main property', () => {
      const manager = new Manager({
        connections: [
          { name: 'foo', adapter: require('../../adapters/memory') },
          { name: 'bar', adapter: require('../../adapters/memory'), main: true },
        ],
      });

      assert.strictEqual(manager.main, 'bar');
    });
  });

  describe('#getPool()', () => {
    it('get main connection when no arg specified', () => {
      const manager = new Manager({
        connections: [
          { name: 'foo', adapter: require('../../adapters/memory') },
          { name: 'bar', adapter: require('../../adapters/memory'), main: true },
        ],
      });

      assert.strictEqual(manager.getPool().name, 'bar');
    });

    it('throw error when pool not exist', () => {
      const manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
          },
        ],
      });

      assert.throws(() => manager.getPool('foo'));
    });
  });

  describe('#main', () => {
    it('value is the first connection when no default set', () => {
      it('get default connection when no arg specified', () => {
        const manager = new Manager({
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

  describe('#runSession()', () => {
    it('throw error and dispose session when error caught', async () => {
      const manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
          },
        ],
      });

      let disposeCalled = false;
      const session = {
        dispose () {
          disposeCalled = true;
        },
      };

      manager.openSession = function () {
        return session;
      };

      try {
        await manager.runSession(() => {
          throw new Error('generated-error');
        });
      } catch (err) {
        assert.strictEqual(err.message, 'generated-error');
      }

      assert(disposeCalled);
    });
  });
});
