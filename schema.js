const FilterError = require('./errors/filter');

class Schema {
  constructor ({ name, fields = {} }) {
    this.name = name;

    this.fields = fields;
    this.fieldNames = Object.keys(fields);
  }

  async filter (row) {
    const error = new FilterError();

    await Promise.all(this.fieldNames.map(async name => {
      const field = this.fields[name];

      try {
        row[name] = await field.doFilter(row[name]);
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
