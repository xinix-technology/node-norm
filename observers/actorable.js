const NString = require('../schemas/nstring');

class Actorable {
  constructor ({
    createdKey = 'created_by',
    updatedKey = 'updated_by',
    userCallback = ctx => ctx.query.session.actor || null,
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
    let { query } = ctx;
    query.rows.forEach(row => {
      row[this.createdKey] = row[this.updatedKey] = this.userCallback(ctx);
    });

    await next();
  }

  async update (ctx, next) {
    let { query } = ctx;
    query.sets[this.updatedKey] = this.userCallback(ctx);

    await next();
  }
}

// eslint-disable
if (typeof window !== 'undefined') {
  let norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Actorable = Actorable;
}
// eslint-enable

module.exports = Actorable;
