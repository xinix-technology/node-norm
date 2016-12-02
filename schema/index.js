'use strict';

const NField = require('./nfield');

var FIELDS = {
  string: require('./nstring'),
};

module.exports = {
  prepare(f, collection) {
    var field;
    if (f instanceof NField) {
      field = f;
    } else {
      field = new FIELDS[f.type](f.name);
    }

    if (f.filter) {
      field.addFilter(f.filter);
    }

    field.collection = collection;

    return field;
  }
};