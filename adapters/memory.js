const Connection = require('../connection');
const uuid = require('uuid');

const data = {};

class Memory extends Connection {
  get data () {
    return (data[this.name] = data[this.name] || {});
  }

  set data (d) {
    data[this.name] = d || {};
  }

  load (query, callback = () => {}) {
    let data = this.data[query.schema.name] || [];

    let { _criteria, _sorts } = query;

    if (_criteria && _criteria.id) {
      const row = data.find(row => row.id === _criteria.id);
      data = row ? [ row ] : [];
    } else {
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
      } else if (query._limit < 0) {
        data = data.slice(query._skip);
      } else {
        data = data.slice(query._skip, query._skip + query._limit);
      }
    }

    return data.map(row => {
      callback(row);
      return row;
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

  insert (query, callback = () => {}) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    return query._inserts.reduce((inserted, row) => {
      row = Object.assign({ id: uuid.v4() }, row);
      data.push(row);
      callback(row);
      inserted++;
      return inserted;
    }, 0);
  }

  update (query) {
    let keys = Object.keys(query._sets);
    return this.load(query).reduce((affected, row) => {
      let fieldChanges = keys.filter(key => {
        if (row[key] === query._sets[key]) {
          return false;
        }

        row[key] = query._sets[key];
        return true;
      });
      if (fieldChanges.length) {
        affected++;
      }
      return affected;
    }, 0);
  }

  drop (query) {
    delete this.data[query.schema.name];
  }

  truncate (query) {
    this.data[query.schema.name] = [];
  }

  delete (query) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    this.load(query).forEach(row => {
      const key = data.indexOf(row);
      if (key >= 0) {
        data.splice(key, 1);
      }
    });
  }
}

module.exports = Memory;
