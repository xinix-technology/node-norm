var connection = require('./connection');
var collection = require('./collection');

module.exports = function() {
  'use strict';

  function norm(id, conId) {
    conId = conId || norm.active;

    var workingId = id + '@' + conId;
    if (!norm.workingCollections[workingId]) {
      norm.workingCollections[workingId] = collection(
        norm.collections[id] || {
          id: id
        },
        norm.connections[conId]
      );
    }

    return norm.workingCollections[workingId];
  }

  Object.setPrototypeOf(norm, {
    add: function(id, adapter) {
      this.connections[id] = connection(id, adapter);
      if (!this.active) {
        this.active = id;
      }
      return this;
    },

    addCollection: function(id, collection) {
      this.collections[id] = collection;
      return this;
    },
  });

  norm.active = null;
  norm.connections = {};
  norm.collections = {};
  norm.workingCollections = {};

  return norm;
};
