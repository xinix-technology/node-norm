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

  async delete () {
    const connection = await this.session.acquire(this.schema.connection);
    let result = await connection.delete(this);
    return result;
  }

  async save ({ filter = true, observer = true } = {}) {
    this.mode = this._inserts.length ? 'insert' : 'update';

    async function doSave ({ query }) {
      const connection = await query.session.acquire(query.schema.connection);
      let { session } = query;

      if (query._inserts.length) {
        if (filter) {
          await Promise.all(query._inserts.map(row => query.schema.filter(row, { session })));
        }

        let rows = [];
        let inserted = await connection.insert(query, row => rows.push(query.schema.attach(row)));
        ctx.result = { inserted, rows };
      } else {
        if (filter) {
          let partial = true;
          await query.schema.filter(query._sets, { session, partial });
        }

        let affected = await connection.update(query);
        ctx.result = { affected };
      }
    }

    let ctx = { query: this, filter };
    if (observer) {
      await this.schema.observe(ctx, doSave);
    } else {
      await doSave(ctx);
    }

    return ctx.result;
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
