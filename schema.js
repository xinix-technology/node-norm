// const FilterError = require('./errors/filter');
const Model = require('./model');

class Schema {
  constructor ({ connection, name, fields = [], modelClass = Model }) {
    this.connection = connection;
    this.name = name;
    this.fields = fields;
    this.modelClass = modelClass;
  }

  attach (row) {
    let M = this.modelClass;
    return new M(this, row);
  }

  // async filter (row) {
  //   const error = new FilterError();
  //
  //   await Promise.all(this.fieldNames.map(async name => {
  //     const field = this.fields[name];
  //
  //     try {
  //       row[name] = await field.doFilter(row[name]);
  //     } catch (err) {
  //       err.field = field;
  //
  //       error.add(err);
  //     }
  //   }));
  //
  //   if (!error.empty()) {
  //     throw error;
  //   }
  //
  //   return row;
  // }
}

module.exports = Schema;
