const FilterError = require('./errors/filter');
const Model = require('./model');
const compose = require('koa-compose');

class Schema {
  constructor ({ name, fields = [], observers = [], modelClass = Model }) {
    if (!name) {
      throw new Error('Schema name is required');
    }

    this.name = name;
    this.fields = fields;
    this.observers = observers;
    this.modelClass = modelClass;
  }

  attach (row = {}) {
    let Model = this.modelClass;

    this.fields.forEach(field => {
      if (row[field.name] === undefined || row[field.name] === null) {
        row[field.name] = null;
      } else {
        row[field.name] = field.attach(row[field.name]);
      }
    });

    return new Model(row);
  }

  observe (ctx, next) {
    if (!this._observerRunner) {
      let units = this.observers.map(observer => {
        return (ctx, next) => {
          if (typeof observer[ctx.query.mode] !== 'function') {
            return next();
          }
          return observer[ctx.query.mode](ctx, next);
        };
      });

      this._observerRunner = compose(units);
    }

    return this._observerRunner(ctx, next);
  }

  async filter (row, { session, partial = false }) {
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

        row[field.name] = await field.execFilter(row[field.name], { session, row });
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
