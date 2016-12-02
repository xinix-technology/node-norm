/*!
 * node-norm
 * Copyright (c) 2016 PT Sagara Xinix Solusitama
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies
 * @private
 */

const Model = require('./model');
const Cursor = require('./cursor');
const Filter = require('./filter');
const schema = require('./schema');
const _ = require('lodash');
const inspect = require('./utils/inspect');
const compose = require('koa-compose');

/**
 * @class `Collection`
 */
class Collection {

  /**
   * Initialize new `Collection`
   *
   * @param  {Constructor} connection
   * @param  {string}      id
   */
  constructor(connection, id) {
    this.connection = connection;
    this.id = id;
    this.fields = {};
    this.observers = { save: [], filter: [], remove: [], search: [], attach: [] };
    this.composedObservers = {};
  }

  /**
   * Create new detached model
   *
   * @param  {object} attributes
   * @return {Model}
   */
  newInstance(attributes) {
    return new Model(this, attributes);
  }

  /**
   * Save model and persist
   *
   * @param  {Model}   model
   * @param  {object}  options
   * @return {Promise}
   */
  save(model, options) {
    options = _.defaults(options || {}, {
      filter: true,
      observer: true
    });


    let context = {
      collection: this,
      model: model,
      options: options,
    };


    let saving = function() {
      console.log('core-saving');
      let promise = options.filter ? this.filter(model) : Promise.resolve();

      return promise.then(function() {
          console.log('core-after-filter');
          return this.connection.persist(this.id, model.dump());
        }.bind(this))
        .then(function(modified) {
          console.log('core-sync');
          model.sync(modified);
        });
    }.bind(this);

    if (options.observer) {
      return this.applyObserve('save', context, saving);
    } else {
      return saving(context);
    }
  }

  observe(observer) {
    [ 'save', 'filter', 'remove', 'search', 'attach' ].forEach(function(method) {
      if (observer[method]) {
        this.observers[method].push(observer[method].bind(this));
      }
    }.bind(this));
  }

  applyObserve(name, context, callback) {
    if (!this.composedObservers[name]) {
      this.composedObservers[name] = compose(this.observers[name]);
    }
    var fn = this.composedObservers[name];
    return new Promise(function(resolve, reject) {
      fn(context, function() {
        try {
          if (callback) {
            // Promise.resolve(callback()).then(function() {
            //   console.log('---', name);
            //   // resolve();
            // }, reject);
          } else {
            // resolve();
          }
        } catch(e) {
          reject(e);
        }
        console.log('xxx')
      }).then(resolve, reject);
    });
  }

  filter(model, key) {
    return this.applyObserve('filter', {
      collection: this,
      model: model,
      key: key,
    }, function() {
      (new Filter(this)).run(model, key);
    }.bind(this));
  }

  /**
   * Remove all rows if first parameter is empty, cursor, or model
   *
   * @param  {mixed}   modelOrCursor MUST be null or Cursor or Model instance
   * @param  {object}  options
   * @return {Promise}
   */
  remove(modelOrCursor, options) {
    var cursor, model;
    if (!modelOrCursor) {
      cursor = this.find();
    } else if (modelOrCursor instanceof Model) {
      model = modelOrCursor;
      cursor = this.find(modelOrCursor.id);
    } else if (modelOrCursor instanceof Cursor) {
      cursor = modelOrCursor;
    }

    return this.connection.remove(cursor)
      .then(() => {
        if (model) {
          model.reset(true);
        }
      });
  }

  /**
   * Find rows
   *
   * @param  {mixed}  criteria MUST be null, object or scalar-type id
   * @return {Cursor}
   */
  find(criteria) {
    if (criteria && 'object' !== typeof criteria) {
      criteria = {'$id': criteria };
    }
    return new Cursor(this, criteria);
  }

  /**
   * Find single row
   *
   * @param  {mixed}  criteria MUST be null, object or scalar-type id
   * @return {Model}
   */
  findOne(criteria) {
    return this.find(criteria).setLimit(1).first();
  }

  /**
   * Attach row data to model
   *
   * @param  {object} row
   * @return {Model}
   */
  attach(row) {
    return new Model(this, row);
  }

  /**
   * Fetch rows by cursor
   * @param  {Cursor}  cursor
   * @return {Promise}
   */
  fetch(cursor) {
    return this.connection.fetch(cursor)
      .then(function(rows) {
        return rows.map(function(row) {
          return this.attach(row);
        }.bind(this));
      }.bind(this));
  }

  addField(fieldOrMeta) {
    var field = schema.prepare(fieldOrMeta, this);
    this.fields[field.name] = field;

    if (!this.firstField) {
      this.firstField = field.name;
    }
  }

  inspect() {
    return inspect(this, ['id', 'connection', 'fields']);
  }
}

/**
 * Expose Collection class
 * @type {class}
 */
module.exports = Collection;
