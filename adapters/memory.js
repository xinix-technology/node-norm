const Connection = require('../connection');
const { v4: uuidv4 } = require('uuid');

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = options.data || {};
  }

  load (query, callback = () => {}) {
    let data = this.data[query.schema.name] || [];

    const { criteria, sorts } = query;

    // if (criteria && typeof criteria.id !== 'undefined') {
    //   const row = data.find(row => row.id === criteria.id);
    //   data = row ? [ row ] : [];
    // } else {
    data = data.filter(row => this._matchCriteria(criteria, row, query.schema));

    if (sorts) {
      const sortFields = Object.keys(sorts);

      data = data.sort((a, b) => {
        let score = 0;
        sortFields.forEach((field, index) => {
          const sortV = sorts[field];
          const fieldScore = Math.pow(2, sortFields.length - index - 1) * sortV;
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
    // }

    return data.map(row => {
      callback(row);
      return row;
    });
  }

  insert (query, callback = () => {}) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    return query.rows.reduce((inserted, qRow) => {
      const row = { id: uuidv4() };
      for (const k in qRow) {
        row[k] = query.schema.getField(k).serialize(qRow[k]);
      }
      data.push(row);
      callback(row);
      inserted++;
      return inserted;
    }, 0);
  }

  update (query) {
    const keys = Object.keys(query.sets);
    return this.load(query).reduce((affected, row) => {
      const fieldChanges = keys.filter(key => {
        if (row[key] === query.sets[key]) {
          return false;
        }

        row[key] = query.schema.getField(key).serialize(query.sets[key]);
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
    const { length, offset } = query;

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

  _matchCriteria (criteria, row, schema) {
    if (!criteria) {
      return true;
    }

    for (const key in criteria) {
      const critValue = criteria[key];
      const [nkey, op = 'eq'] = key.split('!');
      const field = schema.getField(nkey);
      const rowValue = row[nkey];
      switch (op) {
        case 'or': {
          if (!this._matchOrCriteria(critValue, row, schema)) {
            return false;
          }
          break;
        }
        case 'and':
          if (!this._matchAndCriteria(critValue, row, schema)) {
            return false;
          }
          break;
        case 'eq':
          if (field.compare(critValue, rowValue) !== 0) {
            return false;
          }
          break;
        case 'ne':
          if (field.compare(critValue, rowValue) === 0) {
            return false;
          }
          break;
        case 'gt': {
          if (field.compare(critValue, rowValue) <= 0) {
            return false;
          }
          break;
        }
        case 'gte':
          if (field.compare(critValue, rowValue) < 0) {
            return false;
          }
          break;
        case 'lt':
          if (field.compare(critValue, rowValue) >= 0) {
            return false;
          }
          break;
        case 'lte':
          if (field.compare(critValue, rowValue) > 0) {
            return false;
          }
          break;
        case 'in':
          if (field.indexOf(critValue, rowValue) === -1) {
            return false;
          }
          break;
        case 'nin':
          if (field.indexOf(critValue, rowValue) !== -1) {
            return false;
          }
          break;
        case 'like': {
          const re = new RegExp(critValue);
          if (!rowValue.match(re)) {
            return false;
          }
          break;
        }
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

  _matchAndCriteria (criteria, row, schema) {
    for (const subCriteria of criteria) {
      if (!this._matchCriteria(subCriteria, row, schema)) {
        return false;
      }
    }

    return true;
  }

  _matchOrCriteria (criteria, row, schema) {
    for (const subCriteria of criteria) {
      if (this._matchCriteria(subCriteria, row, schema)) {
        return true;
      }
    }

    return false;
  }

  defined ({ name }) {
    return !!this.data[name];
  }

  define ({ name }) {
    this.data[name] = [];
  }

  undefine ({ name }) {
    delete this.data[name];
  }
}

/* istanbul ignore if */
if (typeof window !== 'undefined') {
  const norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.adapters = norm.adapters || {};
  norm.adapters.Memory = Memory;
}

module.exports = Memory;
