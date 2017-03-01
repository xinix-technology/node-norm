class Query {
  constructor ({ tx, schema, criteria }) {
    this.tx = tx;
    this.schema = schema;
    this.find(criteria);

    this._inserts = [];
    this._sets = {};
    this._limit = -1;
    this._skip = 0;
    this._sorts = {};
  }

  async getConnection () {
    return await this.tx.getConnection(this.schema.connection);
  }

  find (criteria = {}) {
    if (typeof criteria === 'object') {
      this._criteria = criteria;
    } else {
      this._criteria = { id: criteria };
    }

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

  attach (row) {
    return this.schema.attach(row);
  }

  async delete () {
    const connection = await this.getConnection();
    return await connection.delete(this);
  }

  async save ({ filter = true } = {}) {
    const connection = await this.getConnection();
    if (this._inserts.length) {
      if (filter) {
        await Promise.all(this._inserts.map(async row => await this.schema.filter(row)));
      }

      let rows = [];
      let inserted = await connection.insert(this, row => rows.push(this.attach(row)));
      return { inserted, rows };
    } else {
      if (filter) {
        await this.schema.filter(this._sets, true);
      }

      let affected = await connection.update(this);
      return { affected };
    }
  }

  async drop () {
    const connection = await this.getConnection();
    return await connection.drop(this);
  }

  async truncate () {
    const connection = await this.getConnection();
    return await connection.truncate(this);
  }

  async all () {
    let models = [];
    const connection = await this.getConnection();
    await connection.load(this, row => models.push(this.attach(row)));
    // console.log('be', connection)
    // let x = await connection.release();
    // console.log('..', x);
    return models;
  }

  async single () {
    this.limit(1);
    let model;
    const connection = await this.getConnection();
    await connection.load(this, row => (model = this.attach(row)));
    return model;
  }
}

module.exports = Query;
