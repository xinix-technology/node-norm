const FilterError = require('./errors/filter');
const Model = require('./model');

class Schema {
  constructor ({ name, connection, fields = [], modelClass = Model }) {
    this.name = name;
    this.connection = connection;
    this.fields = fields;
    this.modelClass = modelClass;
  }

  attach (row) {
    let M = this.modelClass;
    return new M(this, row);
  }

  async filter (row, partial = false) {
    const error = new FilterError();

    if (!row) {
      error.add(new Error('Cannot filter empty row'));
      throw error;
    }

    await Promise.all(this.fields.map(async field => {
      try {
        if (partial && row[field.name] === undefined) {
          return;
        }
        row[field.name] = await field.doFilter(row[field.name]);
      } catch (err) {
        err.field = field;
        error.add(err);
      }
    }));

    if (!error.empty()) {
      throw error;
    }

    return row;
  }
}

module.exports = Schema;
