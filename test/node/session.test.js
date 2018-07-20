const { Manager, Query } = require('../..');
const assert = require('assert');

describe('Session', () => {
  describe('#factory()', () => {
    it('return query instance', () => {
      let manager = new Manager({
        connections: [
          {
            adapter: require('../../adapters/memory'),
          },
        ],
      });
      let session = manager.openSession();
      let query = session.factory('user');
      assert(query instanceof Query);
    });
  });
});
