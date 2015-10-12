(function(root, factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        var _ = require('lodash');
        var cursor = require('./cursor');
        var model = require('./model');

        module.exports = factory(_, cursor, model);
    } else {
        root.norm.collection = factory(root._);
    }
})(this, function(_, cursor, model) {
  'use strict';

  var collectionModule = function(options, connection) {
    cursor = cursor || norm.cursor;
    model = model || norm.model;

    var collection = Object.create({
      get id() {
        return options.id;
      },

      get connection() {
        return connection;
      },

      newInstance: function(attributes) {
        return model(attributes || {}, this);
      },

      save: function(model, options) {
        return connection.persist(this, model)
          .then(function(modified) {
            _.merge(model, modified);
            return model;
          });
      },

      remove: function(model, options) {
        return connection.remove(this, model);
      },

      find: function(criteria) {
        if (criteria && typeof criteria !== 'object') {
          criteria = {'$id': criteria};
        }
        return cursor(criteria, this);
      },

      findOne: function(criteria) {
        return cursor(criteria, this).first();
      },

      inspect: function() {
        return 'Collection(id: ' + options.id + ')';
      },
    });

    return collection;
  };

  return collectionModule;
});
