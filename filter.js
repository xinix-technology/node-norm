'use strict';

const _ = require('lodash');
const Model = require('./model');
const FilterError = require('./errors/filter');

var FILTERS = {
  required(value, options) {
    if (!value) {
      let label = options.field.label || options.field.name;
      throw new FilterError(`Field ${label} is required`);
    }

    return value;
  }
};

class Filter {
  constructor(source) {
    this.source = source;
  }

  run(data, key) {
    let errors = [];
    let fields = this.getEligibleFields(key);
    for(let i in fields) {
      let field = fields[i];
      for(let j in field.filters) {
        try {
          let filter = field.filters[j];
          let value = this.exec(filter, data, field);

          if (data instanceof Model) {
            data.set(field.name, value);
          } else {
            data[field.name] = value;
          }
        } catch(e) {
          errors.push(e);
          break;
        }
      }
    }

    if (errors.length) {
      let e = new FilterError();
      e.children = errors;
      throw e;
    }

    return data;
  }

  exec(filter, data, field) {
    let options = {
      filter: filter,
      field: field,
      data: data instanceof Model ? data.attributes : data,
    };

    if ('string' === typeof filter) {
      return FILTERS[filter](options.data[field.name] || null, options);
    } else {
      throw new Error('Unimplemented');
    }
  }

  getEligibleFields(key) {
    let fields = [];
    if (this.source.constructor.name === 'Collection') {
      if (!key) {
        fields = this.source.fields;
      } else {
        fields.push(this.source.fields[key]);
      }
    } else {
      throw new Error('Unimplemented yet');
    }
    return fields;
  }
}

module.exports = Filter;