const Connection = require('../connection');
const uuid = require('uuid');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = {};
  }

  load (query, callback = () => {}) {
    let data = this.data[query.schema.name] || [];

    let { _criteria, _sorts } = query;

    if (_criteria.id) {
      const row = data.find(row => row.id === _criteria.id);
      if (row) {
        callback(row);
        return [ row ];
      }

      return [];
    }

    data = data.filter(row => this.matchCriteria(_criteria, row))
      .sort((a, b) => {
        let k;
        for (k in _sorts) {
          let x = a[k] > b[k];
          let y = _sorts[k] ? x : !x;
          if (y) return true;
        }
      });

    if (query._skip < 0) {
      return data;
    }

    if (query._limit < 0) {
      return data.slice(query._skip);
    }

    return data.slice(query._skip, query._skip + query._limit);
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

  persist (query, callback = () => {}) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    switch (query._method) {
      case 'insert':
        return query._inserts.map(row => {
          row = Object.assign({ id: uuid.v4() }, row);
          data.push(row);
          callback(row);
          return row;
        });
      case 'update':
        this.query(query).forEach(row => Object.assign(row, query._sets));
        break;
      case 'drop':
        delete this.data[query.schema.name];
        break;
      case 'truncate':
        this.data[query.schema.name] = [];
        break;
      case 'remove':
        this.query(query).forEach(row => {
          const key = data.indexOf(row);
          if (key >= 0) {
            data.splice(key, 1);
          }
        });
        break;
    }
  }
}

module.exports = Memory;
