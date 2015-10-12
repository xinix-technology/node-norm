(function(root, factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        var _ = require('lodash');
        var model = require('./model');

        module.exports = factory(_, model);
    } else {
        root.norm.cursor = factory(root._, root.norm.model);
    }
})(this, function(_, model) {
  'use strict';

  return function(criteria, collection) {
    if (criteria && typeof criteria !== 'object') {
      criteria = {'$id': criteria};
    }
    var cursor = Object.create({
      get collection() {
        return collection;
      },
      get criteria() {
        return criteria;
      },
      fetch: function(options) {
        return collection.connection.query(this, options)
          .then(function(rows) {
            return _.map(rows, function(row) {
              return model(row, collection);
            });
          });
      },
      first: function(options) {
        var limit = this.limit();
        return this.limit(1).fetch()
          .then(function(rows) {
              this.limit(limit);
              return rows[0] || null;
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
      skip: function(skip) {
        if (arguments.length) {
          this._skip = skip;
          return this;
        } else {
          return this._skip;
        }
      },
      sort: function(sorts) {
        if (arguments.length) {
          this._sorts = sorts;
          return this;
        } else {
          return this._sorts;
        }
      },
      inspect: function() {
        return 'Cursor(criteria: ' + JSON.stringify(criteria) + ')';
      }
    });

    return cursor;
  };
});