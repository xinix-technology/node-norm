const NDateTime = require('../schemas/ndatetime');

class Timestampable {
  constructor ({
    createdKey = 'created_time',
    updatedKey = 'updated_time',
  } = {}) {
    this.createdKey = createdKey;
    this.updatedKey = updatedKey;
  }

  initialize (schema) {
    schema.addField(new NDateTime(this.createdKey));
    schema.addField(new NDateTime(this.updatedKey));
  }

  async insert ({ query }, next) {
    query.rows.forEach(row => {
      row[this.createdKey] = row[this.updatedKey] = new Date();
    });

    await next();
  }

  async update ({ query }, next) {
    query.sets[this.updatedKey] = new Date();

    await next();
  }
}

// eslint-disable
if (typeof window !== 'undefined') {
  const norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Timestampable = Timestampable;
}
// eslint-enable

module.exports = Timestampable;
