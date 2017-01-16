class Model {
  constructor ({ connection, schema, row = {} }) {
    this.connection = connection;
    this.schema = schema;
    this.row = row;
  }

  get name () {
    return this.schema.name;
  }

  get id () {
    return this.row.id;
  }

  async save () {
    this.row = await this.connection.persist(this);
  }

  get (key) {
    if (key) {
      return this.row[key];
    }

    return this.row;
  }

}

module.exports = Model;
