class Query {
  constructor ({ manager, name, criteria }) {
    this.manager = manager;
    this.name = name;
    this.inserts = [];
    this._set = {};
    this._criteria = criteria;
    this._limit = -1;
    this._skip = 0;
    this._sort = {};
  }

  get connection () {
    return this.manager.getConnectionByName(this.name);
  }

  get collection () {
    return this.name.indexOf('.') === -1 ? this.name : this.name.split('.')[1];
  }

  get criteria () {
    if (!this._criteria) {
      return;
    }

    if (typeof this._criteria !== 'object') {
      return { id: this._criteria };
    }

    return this._criteria;
  }

  insert (row) {
    this.inserts.push(row);

    return this;
  }

  sort (sort) {
    this._sort = sort;

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
    this._set = set;

    return this;
  }

  async delete () {
    return await this.connection.remove(this);
  }

  async save () {
    return await this.connection.persist(this);
  }

  async all () {
    return await this.connection.query(this);
  }

  async single () {
    const [ row ] = await this.limit(1).connection.query(this);
    return row;
  }
}

module.exports = Query;
