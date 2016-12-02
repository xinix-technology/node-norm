'use strict';

const _ = require('lodash');
const inspect = require('./utils/inspect');

class Model {
  constructor(collection, attributes) {
    this.collection = collection;
    this.attributes = {};
    this.oldAttributes = {};

    this.reset();
    this.sync(attributes);
  }

  save(options) {
    return this.collection.save(this, options);
  }

  remove(options) {
    return this.collection.remove(this, options);
  }

  dump() {
    var cloned = {};
    if (this.id) {
      cloned.$id = this.id;
    }
    for(let i in this.attributes) {
      cloned[i] = this.attributes[i];
    }
    return cloned;
  }

  reset(removed) {
    if (removed) {
      this.state = Model.STATE_REMOVED;
    } else {
      this.state = Model.STATE_DETACHED;
      this.id = null;
      this.attributes = [];
    }
  }

  sync(attributes) {
    attributes = _.clone(attributes);

    if (attributes.$id) {
      this.state = Model.STATE_ATTACHED;
      this.id = attributes.$id;
      delete attributes.$id;
    }

    this.set(attributes);
    this.oldAttributes = this.attributes;
  }

  set(key, value) {
    if ('object' === typeof key) {
      for(var i in key) {
        this.set(i, key[i]);
      }
    } else if ('$id' === key) {
      throw new Error('Set $id is prohibited');
    } else {
      this.attributes[key] = value;
    }

    return this;
  }

  get(key) {
    return this.attributes[key] || null;
  }

  isNew() {
    return this.state === Model.STATE_DETACHED;
  }

  isRemoved() {
    return this.state === Model.STATE_REMOVED;
  }

  toJSON() {
    var obj = {
      '$id': this.id,
    };
    for(let i in this.attributes) {
      obj[i] = this.attributes[i];
    }
    return obj;
  }

  inspect() {
    return inspect(this, ['id', 'attributes', 'state']);
  }
}

Model.STATE_DETACHED = 'STATE_DETACHED';
Model.STATE_ATTACHED = 'STATE_ATTACHED';
Model.STATE_REMOVED  = 'STATE_REMOVED';

module.exports = Model;
