class Query {
  constructor ({ session, schema, criteria }) {
    this.session = session;
    this.schema = this.session.getSchema(schema);

    this.find(criteria);

    this._inserts = [];
    this._sets = {};
    this._limit = -1;
    this._skip = 0;
    this._sorts = undefined;
  }

  find (criteria = {}) {
    this._criteria = typeof criteria === 'object' ? criteria : { id: criteria };

    return this;
  }

  insert (row) {
    this._inserts.push(row);

    return this;
  }

  sort (sorts) {
    this._sorts = sorts;

    return this;
  }

  limit (limit) {
    this._limit = limit;

    return this;
  }

  skip (skip) {
    this._skip = skip;

    return this;
  }

  set (set) {
    this._sets = set;

    return this;
  }

  async delete ({ observer = true } = {}) {
    this.mode = 'delete';

    let ctx = { query: this };

    if (observer) {
      await this.schema.observe(ctx, ctx => this._delete(ctx));
    } else {
      await this._delete(ctx);
    }

    return ctx.result;
  }

  async _delete () {
    const connection = await this.session.acquire(this.schema.connection);
    let result = await connection.delete(this);
    return result;
  }

  async save ({ filter = true, observer = true } = {}) {
    this.mode = this._inserts.length ? 'insert' : 'update';

    let ctx = { query: this, filter };

    if (observer) {
      await this.schema.observe(ctx, ctx => this._save(ctx));
    } else {
      await this._save(ctx);
    }

    return ctx.result;
  }

  async _save (ctx) {
    const connection = await this.session.acquire(this.schema.connection);
    let { session, filter } = this;

    if (this._inserts.length) {
      if (filter) {
        await Promise.all(this._inserts.map(row => this.schema.filter(row, { session })));
      }

      let rows = [];
      let inserted = await connection.insert(this, row => rows.push(this.schema.attach(row)));
      ctx.result = { inserted, rows };
    } else {
      if (filter) {
        let partial = true;
        await this.schema.filter(this._sets, { session, partial });
      }

      let affected = await connection.update(this);
      ctx.result = { affected };
    }
  }

  async drop () {
    const connection = await this.session.acquire(this.schema.connection);
    let result = await connection.drop(this);
    return result;
  }

  async truncate () {
    const connection = await this.session.acquire(this.schema.connection);
    let result = await connection.truncate(this);
    return result;
  }

  async all () {
    let models = [];
    const connection = await this.session.acquire(this.schema.connection);
    await connection.load(this, row => models.push(this.schema.attach(row)));
    return models;
  }

  async count (useSkipAndLimit = false) {
    const connection = await this.session.acquire(this.schema.connection);
    if (typeof connection.count !== 'function') {
      throw new Error('Connection does not implement method count');
    }
    return connection.count(this, useSkipAndLimit);
  }

  async single () {
    this.limit(1);
    let model;
    const connection = await this.session.acquire(this.schema.connection);
    await connection.load(this, row => (model = this.schema.attach(row)));
    return model;
  }

  getInsertedRows () {
    return this._inserts;
  }
}

module.exports = Query;
