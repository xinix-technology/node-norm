class Model {
  constructor (row) {
    for (const key in row) { // eslint-disable-line no-unused-vars
      if (!Object.prototype.hasOwnProperty.call(row, key) || row[key] === undefined) {
        continue;
      }

      this[key] = row[key];
    }
  }
}

module.exports = Model;
