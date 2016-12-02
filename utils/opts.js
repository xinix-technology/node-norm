'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = Opts;

var globalEnv;

function Opts(attributes, env) {
  if (!(this instanceof Opts)) {
    return new Opts(attributes, env);
  }

  if (!env) {
    env = globalEnv;
  }

  globalEnv = this.env = env;

  this.attributes = _.merge({}, attributes || {});
}

Opts.prototype.mergeFile = function(file) {
  file = path.resolve(file);

  var parsed = path.parse(file);
  var envFile = path.join(parsed.dir, parsed.name + '-' + this.env + parsed.ext);

  if (fs.existsSync(file)) {
    try {
      this.merge(require(file));
    } catch(e) {
      console.error('Something happen on options file: ' + file);
      console.error(e.stack);
    }
  }

  if (fs.existsSync(envFile)) {
    try {
      this.merge(require(envFile));
    } catch(e) {
      console.error('Something happen on options file: ' + envFile);
      console.error(e.stack);
    }
  }

  return this;
};

Opts.prototype.merge = function(attributes) {
  this.mergeAttributes(this.attributes, attributes);

  return this;
};

Opts.prototype.mergeAttributes = function(to, from) {
  _.forOwn(from, function(value, i) {
    var f = i.split('!');
    var key = f[0];
    var action = f[1] || 'merge';

    if (action === 'unset') {
      delete to[key];
    } else if (action === 'set') {
      to[key] = from[i];
    } else if (typeof from[key] === 'object' && !Array.isArray(from[key])) {
      if (!to[key] || (typeof to[key] !== 'object' && !Array.isArray(from[key]))) {
        to[key] = {};
      }
      this.mergeAttributes(to[key], from[key]);
    } else {
      to[key] = from[key];
    }
  }.bind(this));
};

Opts.prototype.toArray = function() {
  return this.attributes;
};