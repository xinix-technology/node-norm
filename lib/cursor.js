// jshint esnext: true

var co = require('co');
var _ = require('lodash');
var model = require('./model');

module.exports = function(criteria, collection) {
  'use strict';

  var cursor = Object.create({
    get collection() {
      return collection;
    },
    get criteria() {
      return criteria;
    },
    fetch: function(options) {
      return co(function*() {
        var rows = yield collection.connection.fetch(this, options);

        return _.map(rows, function(row) {
          return model(row, collection);
        });
      }.bind(this));
    },
    limit: function(limit) {
      if (arguments.length) {
        this._limit = limit;
        return this;
      } else {
        return this._limit;
      }
    },
    inspect: function() {
      return 'Cursor(criteria: ' + JSON.stringify(criteria) + ')';
    }
  });

  return cursor;
};