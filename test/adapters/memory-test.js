// jshint esnext: true

var assert = require('assert');
var co = require('co');
var norm = require('../../lib/index');

describe('adapters/memory', function() {
  var n;
  beforeEach(function() {
    n = norm()
      .add('memory', require('../../lib/adapters/memory')());

    n('User').save({ username: 'john', password: 'password' });
    n('User').save({ username: 'jane', password: 'password' });
  });

  describe('search', function() {
    it('should return all rows', function(done) {
      n('User').save({ username: 'steph', password: 'password' });

      co(function*() {
        try {
          var all = yield n('User').find().fetch();
          assert(all.length, 3);
          done();
        } catch(e) {
          done(e);
        }
      });
    });
  });

  describe('create', function() {
    it('should persist new row to memory', function() {
      var user = n('User').newInstance();
      user.username = 'doe';
      user.password = 'password';
      user.save();
      var data = n.connections.memory.data.User;
      assert.equal(data[data.length - 1].$id, user.$id);
    });
  });

  describe('read', function() {
    it('should return specified row', function(done) {
      co(function *() {
        try {
          var user = yield n('User').findOne({
            username: 'jane'
          });
          assert.equal(user.username, 'jane');

          done();
        } catch(e) {
          done(e);
        }
      });
    });
  });

  describe('update', function() {
    it('should persist row with new value', function(done) {
      co(function *() {
        try {
          var user = yield n('User').findOne({
            username: 'john'
          });
          user.username = 'agus';
          user.save();
          var data = n.connections.memory.data.User;
          assert.equal(data[0].username, 'agus');
          done();
        } catch(e) {
          done(e);
        }
      });
    });
  });

  describe('delete', function() {
    it('should delete row', function(done) {
      co(function *() {
        try {
          var user = yield n('User').findOne({
            username: 'jane'
          });
          yield user.remove();
          var data = n.connections.memory.data.User;
          assert.equal(data.length, 1);
          done();
        } catch(e) {
          done(e);
        }
      });
    });
  })
});