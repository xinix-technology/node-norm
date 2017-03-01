class Model {
  constructor (schema, row) {
    this.set('$schema', schema);
    this.sync(row);
  }

  set (key, value) {
    if (key.startsWith('$')) {
      Object.defineProperty(this, key, {
        enumerable: false,
        writable: true,
        configurable: true,
        value,
      });
    } else if (value !== undefined) {
      this[key] = value;
    }
  }

  sync (row) {
    for (let key in row) {
      if (row[key] === undefined) {
        continue;
      }

      this[key] = row[key];
    }
  }
}

module.exports = Model;
