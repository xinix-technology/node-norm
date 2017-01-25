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

  set (key, value) {
    if (arguments.length === 1) {
      const object = key;
      Object.keys(object).forEach(k => {
        this.set(k, object[k]);
      });

      return this;
    }

    this.row[key] = value;
  }

  async save ({ filter = true } = {}) {
    if (filter) {
      this.row = await this.schema.filter(this.row);
    }

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
