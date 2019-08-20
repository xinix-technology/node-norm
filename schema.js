const FilterError = require('./errors/filter');
const Model = require('./model');
const NField = require('./schemas/nfield');
const compose = require('koa-compose');

class Schema {
  constructor ({ name, fields = [], observers = [], modelClass = Model }) {
    if (!name) {
      throw new Error('Schema name is required');
    }

    this.name = name;
    this.fields = fields;
    this.observers = [];
    this.modelClass = modelClass;
    this.attributes = {};

    observers.forEach(observer => this.addObserver(observer));
  }

  set (key, value) {
    this.attributes[key] = value;
    return this;
  }

  get (key) {
    return this.attributes[key];
  }

  getField (name) {
    return this.fields.find(f => f.name === name) || new NField(name);
  }

  addField (field) {
    const existingField = this.fields.find(f => f.name === field.name);
    if (existingField) {
      return;
    }

    this.fields.push(field);
  }

  addObserver (observer) {
    if ('initialize' in observer) {
      observer.initialize(this);
    }
    this.observers.push(observer);
  }

  attach (row, partial = false) {
    const Model = this.modelClass;

    this.fields.forEach(field => {
      switch (row[field.name]) {
        case undefined:
          if (!partial) {
            row[field.name] = null;
          }
          break;
        case null:
          row[field.name] = null;
          break;
        default:
          row[field.name] = field.attach(row[field.name]);
      }
    });

    return new Model(row);
  }

  observe (ctx, next) {
    if (!this._observerRunner) {
      const units = this.observers.map(observer => {
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

        row[field.name] = await field.execFilter(row[field.name], { session, row, schema: this }); // eslint-disable-line require-atomic-updates
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
