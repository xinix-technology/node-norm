const Query = require('./query');
const Schema = require('./schema');

class Connection {
  constructor ({ manager, name, schemas = [] }) {
    this.manager = manager;
    this.name = name;
    this.schemas = {};

    schemas.forEach(schema => this.put(schema));
  }

  put ({ name, fields }) {
    let connection = this;
    this.schemas[name] = new Schema({ connection, name, fields });
    return this;
  }

  get (name) {
    let schema = this.schemas[name];
    if (!schema) {
      return this.put({ name }).get(name);
    }
    return schema;
  }

  factory (name, criteria) {
    let manager = this.manager;
    let schema = this.get(name);
    return new Query({ manager, schema, criteria });
  }

  initialize () {
    // do nothing
  }
}

module.exports = Connection;
