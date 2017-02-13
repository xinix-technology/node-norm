class Query {
  constructor ({ manager, schema, criteria = {} }) {
    this.manager = manager;
    this.schema = schema;
    this._criteria = {};
    this._inserts = [];
    this._sets = {};
    this._limit = -1;
    this._skip = 0;
    this._sorts = {};
    this._method = '';

    this.find(criteria);
  }

  get connection () {
    return this.schema.connection;
  }

  find (criteria) {
    if (!criteria) {
      this._criteria = undefined;
    } else if (typeof criteria === 'object') {
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
    this._method = 'delete';
    return await this.connection.persist(this);
  }

  async save () {
    this._method = this._inserts.length ? 'insert' : 'update';
    let rows = [];
    await this.connection.persist(this, row => rows.push(this.attach(row)));
    return rows;
  }

  async drop () {
    this._method = 'drop';
    return await this.connection.persist(this);
  }

  async truncate () {
    this._method = 'truncate';
    return await this.connection.persist(this);
  }

  async all () {
    let models = [];
    await this.connection.load(this, row => models.push(this.attach(row)));
    return models;
  }

  async single () {
    this.limit(1);
    let model;
    await this.connection.load(this, row => (model = this.attach(row)));
    return model;
  }
}

module.exports = Query;
