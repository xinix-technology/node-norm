const assert = require('assert');
const Manager = require('../manager');
const Memory = require('../adapters/memory');
const sinon = require('sinon');

describe('Manager', () => {
  describe('.adapter()', () => {
    it('validate adapter', () => {
      let Adapter = Manager.adapter();
      assert.equal(Adapter, Memory);

      Adapter = Manager.adapter(require('../adapters/memory'));
      assert.equal(Adapter, Memory);

      assert.throws(() => {
        Adapter = Manager.adapter('other-adapter');
      });

      class Foo {}
      Adapter = Manager.adapter(Foo);
      assert.equal(Adapter, Foo);
    });
  });

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

    it('throw error when pool not exist', () => {
      let manager = new Manager();

      assert.throws(() => manager.getPool('foo'));
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

  describe('#runSession()', () => {
    it('throw error and dispose session when error caught', async () => {
      const manager = new Manager();
      let session = {
        dispose: sinon.spy(),
      };

      let stub = sinon.stub(manager, 'openSession');
      stub.returns(session);

      try {
        await manager.runSession(() => {
          throw new Error('generated-error');
        });
      } catch (err) {
        assert.equal(err.message, 'generated-error');
      }

      assert(session.dispose.called);

      stub.restore();
    });
  });
});
