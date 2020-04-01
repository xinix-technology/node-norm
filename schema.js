const FilterError = require('./errors/filter');
const Model = require('./model');
const NField = require('./schemas/nfield');
const compose = require('koa-compose');

const kObservers = Symbol('observers');
const kObserverChain = Symbol('observerChain');
const kAttrs = Symbol('attrs');

class Schema {
  constructor ({ name, fields = [], observers = [], modelClass = Model }) {
    if (!name) {
      throw new Error('Schema name is required');
    }

    this.name = name;
    this.fields = [...fields];
    this.modelClass = modelClass;

    this[kObservers] = [];
    this[kAttrs] = {};

    observers.forEach(observer => this.addObserver(observer));
  }

  set (key, value) {
    this[kAttrs][key] = value;
    return this;
  }

  get (key) {
    return this[kAttrs][key];
  }

  getField (name) {
    return this.fields.find(f => f.name === name) || new NField(name);
  }

  addField (field) {
    const existingField = this.fields.find(f => f.name === field.name);
    if (existingField) {
      throw new Error(`Duplicate field (${field.name})`);
    }

    this.fields.push(field);
  }

  addObserver (observer) {
    if ('initialize' in observer) {
      observer.initialize(this);
    }

    this[kObservers].push(observer);

    // reset observer chain when observer added
    this[kObserverChain] = undefined;
  }

  removeObserver (observer) {
    const index = this[kObservers].indexOf(observer);
    /* istanbul ignore if */
    if (index === -1) {
      return;
    }

    this[kObservers].splice(index, 1);

    if ('uninitialize' in observer) {
      observer.uninitialize(this);
    }

    // reset observer chain when observer removed
    this[kObserverChain] = undefined;
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
    if (!this[kObserverChain]) {
      const units = this[kObservers].map(observer => {
        return (ctx, next) => {
          if (typeof observer[ctx.mode] !== 'function') {
            return next();
          }
          return observer[ctx.mode](ctx, next);
        };
      });

      this[kObserverChain] = compose(units);
    }

    return this[kObserverChain](ctx, next);
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

        row[field.name] = await field.execFilter(row[field.name], { session, row, schema: this });
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
