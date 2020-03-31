const NString = require('../schemas/nstring');

class Actorable {
  constructor ({
    createdKey = 'created_by',
    updatedKey = 'updated_by',
    userCallback = ctx => {
      const { user } = ctx.state;
      if (user) {
        return user.sub;
      }
    },
  } = {}) {
    this.createdKey = createdKey;
    this.updatedKey = updatedKey;
    this.userCallback = userCallback;
  }

  initialize (schema) {
    schema.addField(new NString(this.createdKey));
    schema.addField(new NString(this.updatedKey));
  }

  async insert (ctx, next) {
    const { query } = ctx;
    query.rows.forEach(row => {
      row[this.createdKey] = row[this.updatedKey] = this.userCallback(ctx) || /* istanbul ignore next */ null;
    });

    await next();
  }

  async update (ctx, next) {
    const { query } = ctx;
    query.sets[this.updatedKey] = this.userCallback(ctx) || /* istanbul ignore next */ null;

    await next();
  }
}

// eslint-disable
/* istanbul ignore if */
if (typeof window !== 'undefined') {
  const norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Actorable = Actorable;
}
// eslint-enable

module.exports = Actorable;
