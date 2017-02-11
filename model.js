class Model {
  constructor (schema, row) {
    this.set('$schema', schema);
    this.sync(row);
  }

  set (key, value) {
    if (key[0] === '$') {
      Object.defineProperty(this, key, {
        enumerable: false,
        writable: true,
        configurable: true,
      });
    } else {
      this[key] = value;
    }
  }

  sync (row) {
    Object.assign(this, row);
  }
}

module.exports = Model;
