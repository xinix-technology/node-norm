const { Manager, Query } = require('../..');
const assert = require('assert');

describe('Session', () => {
  describe('#factory()', () => {
    it('return query instance', () => {
      const manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
          },
        ],
      });
      const session = manager.openSession();
      const query = session.factory('user');
      assert(query instanceof Query);
    });
  });
});
