const Connection = require('../connection');
const uuid = require('uuid');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = {};
  }

  async fetch (collection) {
    const data = this.data[collection.name] || [];
    return await data[collection._offset];
  }

  persist (model) {
    const data = this.data[model.name] = this.data[model.name] || [];

    if (model.id) {
      let row = data[model.id];
      if (row) {
        data[model.id] = Object.assign(data[model.id], model.row);
      }

      return;
    }

    let row = Object.assign({ id: uuid.v4() }, model.row);
    data.push(row);

    return row;
  }
}

module.exports = Memory;
