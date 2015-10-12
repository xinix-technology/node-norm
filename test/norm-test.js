var assert = require('assert');
var norm = require('../lib/index');


describe('norm', function() {
  'use strict';

  var n;
  beforeEach(function() {
    n = norm();
  });

  describe('constructor', function() {
    it('should return norm object type fn', function() {
      assert(n);
      assert.equal(typeof n, 'function');
    });
  });

  describe('#add', function() {
    it('should able to chain', function() {
      var result = n.add('test', {});
      assert.equal(result, n);
    });

    it('should add new connection with spesified name', function() {
      n.add('test', {});
      assert(n.connections.test);
    });

    it('should add active connection for first time add new connection', function() {
      n.add('test', {});
      assert.equal(n.active, 'test');
    });
  });

  describe('#addCollection', function() {
    it('should be able to chain', function() {
      var result = n.addCollection('Test', {});
      assert.equal(result, n);
    });

    it('should add new collection with spesified name', function() {
      n.addCollection('Test', {});
      assert(n.collections.Test);
    });
  });

  describe('call', function() {
    it('should return collection with default connection', function() {
      n.add('test', {})
        .addCollection('Col', {});

      var collection = n('Col');

      assert.equal(collection.connection.id, 'test');
    });
  });
});
