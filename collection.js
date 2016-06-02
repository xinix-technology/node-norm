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
    return this.connection.persist(this.id, model.dump())
      .then(function(modified) {
        model.sync(modified);
      });
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
}

/**
 * Expose Collection class
 * @type {class}
 */
module.exports = Collection;
