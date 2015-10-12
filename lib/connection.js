var _ = require('lodash');
var collection = require('./collection');

module.exports = function(id, adapter) {
  'use strict';

  var connection = Object.create({
    persist: function() {
      throw new Error('Please override persist');
    },
    fetch: function() {
      throw new Error('Please override fetch');
    },
    remove: function() {
      throw new Error('Please override remove');
    },
    inspect: function() {
      return 'Connection(id: ' + id + ')';
    }
  });

  _.merge(connection, adapter);

  return connection;
};