(function(root, factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        var connection = require('./connection');
        var collection = require('./collection');

        module.exports = factory(connection, collection);
    } else {
        root.norm = factory();
    }
})(this, function(connection, collection) {
  'use strict';

  var normModule = function() {
    connection = connection || normModule.connection;
    collection = collection || normModule.collection;

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

  normModule.adapters = {};

  return normModule;
});
