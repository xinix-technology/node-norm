'use strict';

const _ = require('lodash');

class Model {
  constructor(collection, attributes) {
    Object.defineProperties(this, {
      collection: { enumerable: false, writable: false, configurable: false, value: collection },
      attributes: { enumerable: true, writable: true, configurable: true, value: attributes },
      oldAttributes: { enumerable: false, writable: true, configurable: false, value: {} },
    });

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

  toJSON() {
    var obj = {
      '$id': this.id,
    };
    for(let i in this.attributes) {
      obj[i] = this.attributes[i];
    }
    return obj;
  }
}

Model.STATE_DETACHED = 'STATE_DETACHED';
Model.STATE_ATTACHED = 'STATE_ATTACHED';
Model.STATE_REMOVED  = 'STATE_REMOVED';

module.exports = Model;
