const Connection = require('../connection');
const uuidv4 = require('uuid/v4');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = options.data || {};
  }

  load (query, callback = () => {}) {
    let data = this.data[query.schema.name] || [];

    let { criteria, sorts } = query;

    if (criteria && typeof criteria.id !== 'undefined') {
      const row = data.find(row => row.id === criteria.id);
      data = row ? [ row ] : [];
    } else {
      data = data.filter(row => this._matchCriteria(criteria, row));

      if (sorts) {
        let sortFields = Object.keys(sorts);

        data = data.sort((a, b) => {
          let score = 0;
          sortFields.forEach((field, index) => {
            let sortV = sorts[field];
            let fieldScore = Math.pow(2, sortFields.length - index - 1) * sortV;
            if (a[field] < b[field]) {
              score -= fieldScore;
            } else if (a[field] > b[field]) {
              score += fieldScore;
            }
          });
          return score;
        });
      }

      if (query.offset < 0) {
        return data;
      } else if (query.length < 0) {
        data = data.slice(query.offset);
      } else {
        data = data.slice(query.offset, query.offset + query.length);
      }
    }

    return data.map(row => {
      callback(row);
      return row;
    });
  }

  insert (query, callback = () => {}) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    return query.rows.reduce((inserted, row) => {
      row = Object.assign({ id: uuidv4() }, row);
      data.push(row);
      callback(row);
      inserted++;
      return inserted;
    }, 0);
  }

  update (query) {
    let keys = Object.keys(query.sets);
    return this.load(query).reduce((affected, row) => {
      let fieldChanges = keys.filter(key => {
        if (row[key] === query.sets[key]) {
          return false;
        }

        row[key] = query.sets[key];
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

  async count (query, useSkipAndLimit) {
    let { length, offset } = query;

    if (!useSkipAndLimit) {
      query.offset = 0;
      query.length = -1;
    }

    let count = 0;

    await this.load(query, () => count++);

    query.offset = offset;
    query.length = length;

    return count;
  }

  _matchCriteria (criteria, row) {
    if (!criteria) {
      return true;
    }

    for (let key in criteria) {
      let critValue = criteria[key];
      let [ nkey, op = 'eq' ] = key.split('!');
      let rowValue = row[nkey];
      switch (op) {
        case 'or':
          let valid = false;
          for (let subCriteria of critValue) {
            let match = this._matchCriteria(subCriteria, row);
            if (match) {
              valid = true;
              break;
            }
          }
          if (!valid) {
            return false;
          }
          break;
        case 'and':
          for (let subCriteria of critValue) {
            if (!this._matchCriteria(subCriteria, row)) {
              return false;
            }
          }
          break;
        case 'eq':
          if (critValue !== rowValue) {
            return false;
          }
          break;
        case 'ne':
          if (critValue === rowValue) {
            return false;
          }
          break;
        case 'gt':
          if (!(rowValue > critValue)) {
            return false;
          }
          break;
        case 'gte':
          if (!(rowValue >= critValue)) {
            return false;
          }
          break;
        case 'lt':
          if (!(rowValue < critValue)) {
            return false;
          }
          break;
        case 'lte':
          if (!(rowValue <= critValue)) {
            return false;
          }
          break;
        case 'in':
          if (critValue.indexOf(rowValue) === -1) {
            return false;
          }
          break;
        case 'nin':
          if (critValue.indexOf(rowValue) !== -1) {
            return false;
          }
          break;
        case 'like':
          let re = new RegExp(critValue);
          if (!rowValue.match(re)) {
            return false;
          }
          break;
        case 'regex':
          if (!rowValue.match(critValue)) {
            return false;
          }
          break;
        case 'where':
          if (!critValue(rowValue, row)) {
            return false;
          }
          break;
        default:
          throw new Error(`Operator '${op}' is not implemented yet!`);
      }
    }

    return true;
  }
}

if (typeof window !== 'undefined') {
  let norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.adapters = norm.adapters || {};
  norm.adapters.Memory = Memory;
}

module.exports = Memory;
