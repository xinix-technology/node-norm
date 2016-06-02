'use strict';

const Memory = require('./memory');
const fs = require('fs-promise');
const path = require('path');

class Disk extends Memory {
  constructor(repository, id, options) {
    super(repository, id, options);

    this.file = this.options.file;
  }

  ensureData() {
    if (!this._ensured) {
      var file = this.file;
      return fs.ensureFile(file)
        .then(() => fs.readFile(file))
        .then(buffer => JSON.parse(buffer))
        .catch(err => {})
        .then(function(data) {
          this._ensured = true;
          this.data = data || {};
        }.bind(this));
    } else {
      return Promise.resolve();
    }
  }

  persist(collectionId, row) {
    var superPersist = super.persist.bind(this);
    return this.ensureData()
      .then(function() {
        return superPersist(collectionId, row);
      })
      .then(function(row) {
        return fs.writeFile(this.file, JSON.stringify(this.data, null, 2))
          .then(() => row);
      }.bind(this));
  }

  remove(cursor) {
    var superRemove = super.remove.bind(this);
    return this.ensureData()
      .then(function() {
        return superRemove(cursor);
      })
      .then(function(row) {
        return fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
      }.bind(this));
  }

  fetch(cursor) {
    var superFetch = super.fetch.bind(this);
    return this.ensureData()
      .then(function() {
        return superFetch(cursor);
      });
  }
}

module.exports = Disk;