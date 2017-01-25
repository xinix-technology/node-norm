const Collection = require('./collection');
const Schema = require('./schema');

class Connection {
  constructor ({ name, schemas = [] }) {
    this.name = name;
    this.schemas = schemas;

    this.cachedCollections = {};
  }

  factory (name) {
    if (name in this.cachedCollections === false) {
      const connection = this;
      const schema = new Schema(this.schemas.find(schema => schema.name === name) || { name });

      this.cachedCollections[name] = new Collection({ connection, schema });
    }

    return this.cachedCollections[name].clone();
  }

  static create (options) {
    const Adapter = Connection.adapter(options.adapter);

    return new Adapter(options);
  }

  static adapter (name) {
    if (typeof name === 'function') {
      return name;
    }

    if (name.indexOf('-') > -1) {
      return require(name);
    }

    return require(`./adapters/${name}`);
  }
}

module.exports = Connection;
