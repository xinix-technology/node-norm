var uuid = require('node-uuid');
var _ = require('lodash');

module.exports = function(options) {
  'use strict';

  return {
    persist: function(collection, model) {
      this.data = this.data || {};
      this.data[collection.id] = this.data[collection.id] || [];

      if (!model.$id) {
        model.$id = uuid.v1();
        this.data[collection.id].push(model);
      } else {
        var row = _.find(this.data[collection.id], function(row) {
          return row.$id === model.$id;
        });
        _.merge(row, model);
      }
      return Promise.resolve(model);
    },

    remove: function(collection, model) {
      this.data = this.data || {};
      this.data[collection.id] = this.data[collection.id] || [];

      for(var i in this.data[collection.id]) {
        var row = this.data[collection.id][i];

        if (row.$id === model.$id) {
          this.data[collection.id].splice(i, 1);
          break;
        }
      }

      return Promise.resolve();
    },

    fetch: function(cursor, options) {
      this.data = this.data || {};
      this.data[cursor.collection.id] = this.data[cursor.collection.id] || [];

      var criteria = cursor.criteria || {};
      var results = [];
      for(var i in this.data[cursor.collection.id]) {
        var row = this.data[cursor.collection.id][i];
        var caught = _.some(criteria, function(v, i) {
          var x = i.split('!');
          var k = x[0];
          var op = x[1] || 'eq';
          switch(op) {
            case 'eq':
              if (row[k] !== v) {
                return true;
              }
              break;
            default:
              throw new Error('Unimplemented');
          }
        });
        if (!caught) {
          results.push(row);
        }
      }

      return results;
    }
  };
};