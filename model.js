class Model {
  constructor (row) {
    for (const key in row) {
      if (!Object.prototype.hasOwnProperty.call(row, key) || row[key] === undefined) {
        continue;
      }

      this[key] = row[key];
    }
  }
}

module.exports = Model;
