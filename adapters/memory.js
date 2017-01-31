const Connection = require('../connection');
const uuid = require('uuid');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = {};
  }

  query (query) {
    const data = this.data[query.collection] || [];

    if (!query.criteria) {
      return data;
    }

    if (query.criteria.id) {
      const row = data.find(row => row.id === query.criteria.id);
      return row ? [ row ] : [];
    }

    return data.filter(row => {
      console.log('row', row);
      return row;
    });
  }

  persist (query) {
    const data = this.data[query.collection] = this.data[query.collection] || [];

    if (query.inserts.length) {
      return query.inserts.map(row => {
        row = Object.assign({ id: uuid.v4() }, row);
        data.push(row);
        return row;
      });
    }

    const result = this.query(query).map(row => {
      return Object.assign(row, query._set);
    });

    console.log('>', data);

    return result;
  }

  remove (query) {
    const data = this.data[query.collection] = this.data[query.collection] || [];

    this.query(query).forEach(row => {
      const key = data.indexOf(row);
      if (key >= 0) {
        data.splice(key, 1);
      }
    });
  }
}

module.exports = Memory;
