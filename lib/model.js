var _ = require('lodash');

module.exports = function(attributes, collection) {
  'use strict';

  var model = Object.create({
    save: function(options) {
      return collection.save(this, options);
    },
    remove: function(options) {
      return collection.remove(this, options);
    }
  });

  _.merge(model, attributes);

  return model;
};
