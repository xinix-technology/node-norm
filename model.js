class Model {
  constructor (row) {
    for (let key in row) {
      if (!row.hasOwnProperty(key) || row[key] === undefined) {
        continue;
      }

      this[key] = row[key];
    }
  }
}

module.exports = Model;
