const bcrypt = require('bcryptjs');

module.exports = class Hashable {
  constructor ({ rounds = 10, field = 'password' } = {}) {
    this.field = field;
    this.rounds = rounds;
  }

  async insert ({ query }, next) {
    await Promise.all(query.rows.map(async row => {
      if (row[this.field]) {
        row[this.field] = await bcrypt.hash(row[this.field], this.rounds);
      }
    }));

    await next();
  }

  async update ({ query }, next) {
    const { session, sets } = query;

    if (sets[this.field] === undefined) {
      return next();
    }

    const count = await session.factory(query.schema.name, query.criteria).count(true);
    if (count < 1) {
      return next();
    }

    if (count > 1) {
      throw new Error('Halt insecure sharing hash');
    }

    const model = await session.factory(query.schema.name, query.criteria).single();
    if (!model) {
      return next();
    }

    if (sets[this.field] && model[this.field] !== sets[this.field]) {
      sets[this.field] = await bcrypt.hash(sets[this.field], this.rounds);
    }

    await next();
  }
};
