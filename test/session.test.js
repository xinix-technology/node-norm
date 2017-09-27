const Manager = require('../manager');
const Query = require('../query');
const assert = require('assert');

describe('Session', () => {
  describe('#factory()', () => {
    it('return query instance', () => {
      let manager = new Manager();
      let session = manager.openSession();
      let query = session.factory('user');
      assert(query instanceof Query);
    });
  });
});
