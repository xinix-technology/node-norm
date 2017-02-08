const Connection = require('../connection');
const uuid = require('uuid');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = {};
  }

  query (query) {
    const data = this.data[query.collection] || [];

    if (query.criteria && query.criteria.id) {
      const row = data.find(row => row.id === query.criteria.id);
      return row ? [ row ] : [];
    }

    let rows = data;
    if (query.criteria) {
      rows = data.filter(row => this.matchCriteria(query.criteria, row));
    }

    return rows.sort((a, b) => {
      let k;
      for (k in query._sort) {
        let x = a[k] > b[k];
        let y = query._sort[k] ? x : !x;
        if (y) return true;
      }
    });
  }

  matchCriteria (criteria, row) {
    if (!criteria) {
      return true;
    }

    for (let i in criteria) {
      if (criteria[i] !== row[i]) {
        return false;
      }
    }

    return true;
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
