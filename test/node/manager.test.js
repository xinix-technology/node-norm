const assert = require('assert');
const { Manager } = require('../..');

describe('Manager', () => {
  describe('contructor', () => {
    it('create instance with connection when arg connections specified', () => {
      const connections = [
        { name: 'one', adapter: require('../../adapters/memory') },
      ];

      const manager = new Manager({ connections });

      assert.strictEqual(manager.getPool().name, 'one');
      assert.strictEqual(manager.getPool('one').name, 'one');
    });
  });

  describe('#put()', () => {
    it('add new connection', () => {
      const manager = new Manager();

      manager.putPool({ name: 'one', adapter: require('../../adapters/memory') });

      assert.strictEqual(manager.getPool().name, 'one');
    });
  });

  describe('#getPool()', () => {
    it('get main connection when no arg specified', () => {
      const manager = new Manager({
        connections: [
          { name: 'foo', adapter: require('../../adapters/memory') },
          { name: 'bar', adapter: require('../../adapters/memory') },
        ],
      });

      assert.strictEqual(manager.getPool().name, 'foo');
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
