var model = require('./model');
var cursor = require('./cursor');
var _ = require('lodash');

module.exports = function(options, connection) {
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
      return cursor(criteria, this).limit(1).fetch()
        .then(function(rows) {
          return rows[0] || null;
        });
    },

    inspect: function() {
      return 'Collection(id: ' + options.id + ')';
    },
  });

  return collection;
};
