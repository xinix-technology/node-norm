const Model = require('./model');

class Collection {
  constructor ({ connection, schema }) {
    this.connection = connection;
    this.schema = schema;

    this._criteria = {};
    this._limit = -1;
    this._skip = -1;

    this._size = 0;
    this._offset = 0;
  }

  get name () {
    return this.schema.name;
  }

  clone () {
    return new Collection(this);
  }

  new (row) {
    const { connection, schema } = this;
    return new Model({ connection, schema, row });
  }

  async all () {
    const rows = [];
    let row;
    while ((row = await this.single())) {
      rows.push(row);
    }

    this.rows = rows;

    return rows;
  }

  async single () {
    const row = await this.connection.fetch(this);

    this._size++;
    this._offset++;

    return row;
  }
}

module.exports = Collection;
