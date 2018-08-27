class Actorable {
  constructor ({
    createdKey = 'created_by',
    updatedKey = 'updated_by',
    userCallback = ctx => '',
  } = {}) {
    this.createdKey = createdKey;
    this.updatedKey = updatedKey;
    this.userCallback = userCallback;
  }

  async insert ({ query }, next) {
    query.rows.forEach(row => {
      row[this.createdKey] = row[this.updatedKey] = this.userCallback();
    });

    await next();
  }

  async update ({ query }, next) {
    query.sets[this.updatedKey] = this.userCallback();

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
