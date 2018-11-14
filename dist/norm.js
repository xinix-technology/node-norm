/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./adapters/memory.js":
/*!****************************!*\
  !*** ./adapters/memory.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Connection = __webpack_require__(/*! ../connection */ "./connection.js");
const uuidv4 = __webpack_require__(/*! uuid/v4 */ "./node_modules/uuid/v4.js");

class Memory extends Connection {
  constructor (options) {
    super(options);

    this.data = options.data || {};
  }

  load (query, callback = () => {}) {
    let data = this.data[query.schema.name] || [];

    let { criteria, sorts } = query;

    // if (criteria && typeof criteria.id !== 'undefined') {
    //   const row = data.find(row => row.id === criteria.id);
    //   data = row ? [ row ] : [];
    // } else {
    data = data.filter(row => this._matchCriteria(criteria, row, query.schema));

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
    // }

    return data.map(row => {
      callback(row);
      return row;
    });
  }

  insert (query, callback = () => {}) {
    const data = this.data[query.schema.name] = this.data[query.schema.name] || [];

    return query.rows.reduce((inserted, qRow) => {
      let row = { id: uuidv4() };
      for (let k in qRow) {
        row[k] = query.schema.getField(k).serialize(qRow[k]);
      }
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

  _matchCriteria (criteria, row, schema) {
    if (!criteria) {
      return true;
    }

    for (let key in criteria) {
      let critValue = criteria[key];
      let [ nkey, op = 'eq' ] = key.split('!');
      let field = schema.getField(nkey);
      let rowValue = row[nkey];
      switch (op) {
        case 'or': {
          let valid = false;
          for (let subCriteria of critValue) {
            let match = this._matchCriteria(subCriteria, row, schema);
            if (match) {
              valid = true;
              break;
            }
          }
          if (!valid) {
            return false;
          }
          break;
        }
        case 'and':
          for (let subCriteria of critValue) {
            if (!this._matchCriteria(subCriteria, row, schema)) {
              return false;
            }
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
          let re = new RegExp(critValue);
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


/***/ }),

/***/ "./connection.js":
/*!***********************!*\
  !*** ./connection.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

class Connection {
  constructor ({ name }) {
    this.name = name;
    this._hasTx = false;
  }

  async begin () {
    if (this._hasTx) {
      return;
    }

    await this._begin();

    this._hasTx = true;
  }

  async commit () {
    if (!this._hasTx) {
      return;
    }

    await this._commit();
    this._hasTx = false;
  }

  async rollback () {
    if (!this._hasTx) {
      return;
    }

    await this._rollback();
    this._hasTx = false;
  }

  _begin () {
    // do nothing
  }

  _commit () {
    // do nothing
  }

  _rollback () {
    // do nothing
  }
}

module.exports = Connection;


/***/ }),

/***/ "./errors/filter.js":
/*!**************************!*\
  !*** ./errors/filter.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

class Filter extends Error {
  constructor () {
    super();

    this.status = 400;
    this.children = [];
  }

  get message () {
    return this.children.map(child => child.message).join(', ');
  }

  add (value) {
    this.children.push(value);
  }

  empty () {
    return this.children.length === 0;
  }
}

module.exports = Filter;


/***/ }),

/***/ "./filter.js":
/*!*******************!*\
  !*** ./filter.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

let filters = {};

class Filter {
  static tokenize (signature) {
    if (typeof signature !== 'string') {
      throw new Error('Cannot tokenize non-string filter signature');
    }

    let [ head, ...rest ] = signature.split(':');
    rest = rest.join(':');
    rest = rest.length === 0 ? [] : rest.split(',');

    return [ head, ...rest ];
  }

  static get (signature) {
    let signatureType = typeof signature;

    if (signatureType === 'function') {
      return signature;
    }

    if (signatureType === 'string') {
      signature = Filter.tokenize(signature);
    }

    if (!Array.isArray(signature)) {
      throw new Error(`Unknown filter by ${signatureType}`);
    }

    let [ fn, ...args ] = signature;

    if (fn in filters === false) {
      try {
        filters[fn] = __webpack_require__("./filters sync recursive ^\\.\\/.*$")("./" + fn);
      } catch (err) {
        filters[fn] = null;
      }
    }

    if (!filters[fn]) {
      let normalizedSignature = 'unknown';
      try {
        normalizedSignature = JSON.stringify(signature);
      } catch (err) {
        // noop
      }
      throw new Error(`Filter ${fn} not found <${signatureType}(${normalizedSignature})>`);
    }

    return filters[fn](...args);
  }

  static put (name, filter) {
    filters[name] = filter;
  }

  static reset () {
    filters = {};
  }
}

module.exports = Filter;


/***/ }),

/***/ "./filters sync recursive ^\\.\\/.*$":
/*!*******************************!*\
  !*** ./filters sync ^\.\/.*$ ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./are": "./filters/are.js",
	"./are.js": "./filters/are.js",
	"./default": "./filters/default.js",
	"./default.js": "./filters/default.js",
	"./email": "./filters/email.js",
	"./email.js": "./filters/email.js",
	"./enum": "./filters/enum.js",
	"./enum.js": "./filters/enum.js",
	"./exists": "./filters/exists.js",
	"./exists.js": "./filters/exists.js",
	"./notEmpty": "./filters/notEmpty.js",
	"./notEmpty.js": "./filters/notEmpty.js",
	"./notExists": "./filters/notExists.js",
	"./notExists.js": "./filters/notExists.js",
	"./required": "./filters/required.js",
	"./required.js": "./filters/required.js",
	"./requiredIf": "./filters/requiredIf.js",
	"./requiredIf.js": "./filters/requiredIf.js",
	"./unique": "./filters/unique.js",
	"./unique.js": "./filters/unique.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./filters sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./filters/are.js":
/*!************************!*\
  !*** ./filters/are.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (schema) {
  return async function (value = null, { session, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let err = new Error(`Field ${name} values must be ${schema}`);

    if (!Array.isArray(value)) {
      throw err;
    }

    try {
      let schemaO = session.getSchema(schema);
      await Promise.all(value.map(row => schemaO.filter(row, { session })));
      value = value.map(row => schemaO.attach(row));
    } catch (err) {
      console.error(`Caught error at nested model, ${err.stack}`);
      throw new Error(`Field ${name} must be compatible to '${schema}'`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/default.js":
/*!****************************!*\
  !*** ./filters/default.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function def (defaultValue) {
  return function (value = null) {
    if (!value) {
      return defaultValue;
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/email.js":
/*!**************************!*\
  !*** ./filters/email.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function email () {
  return function (value = null, { field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    value = value.toLowerCase();

    let err = new Error(`Field ${name} must be valid email`);

    const parts = value.split('@');

    if (parts.length !== 2) {
      throw err;
    }

    const domain = parts.pop();
    let user = parts.join('@');

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      user = user.replace(/\./g, '').toLowerCase();
    }

    if (user.length > 64 || domain.length > 256) {
      throw err;
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/enum.js":
/*!*************************!*\
  !*** ./filters/enum.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (...enums) {
  return function (value = null, { field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    if (enums.indexOf(value) === -1) {
      throw new Error(`Field ${name} out of enum range`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/exists.js":
/*!***************************!*\
  !*** ./filters/exists.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function exists (schema, key = 'id') {
  return async function (value, { session, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let criteria = {};
    criteria[key] = value;

    if (!(await session.factory(schema, criteria).single())) {
      throw new Error(`Field ${name} must be exists`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/notEmpty.js":
/*!*****************************!*\
  !*** ./filters/notEmpty.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function notEmpty () {
  return function (value, { field: { name } }) {
    if (!value || (Array.isArray(value) && value.length)) {
      throw new Error(`Field ${name} must not empty`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/notExists.js":
/*!******************************!*\
  !*** ./filters/notExists.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function notExists (schema) {
  return async function (value, { row, session, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let criteria = { [name]: value };
    let foundRow = await session.factory(schema, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} already exists in ${schema}`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/required.js":
/*!*****************************!*\
  !*** ./filters/required.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function required () {
  return function (value = null, { field: { name = 'unknown' } }) {
    if (value === null || value === '') {
      throw new Error(`Field ${name} is required`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/requiredIf.js":
/*!*******************************!*\
  !*** ./filters/requiredIf.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function requiredIf (key, expected) {
  return function (value = null, { session, row, field: { name = 'unknown' } }) {
    if (row[key] === expected && (value === null || value === '')) {
      throw new Error(`Field ${name} is required`);
    }

    return value;
  };
};


/***/ }),

/***/ "./filters/unique.js":
/*!***************************!*\
  !*** ./filters/unique.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function unique () {
  return async function (value, { row, session, schema, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let criteria = { [name]: value };
    let foundRow = await session.factory(schema.name, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} must be unique`);
    }

    return value;
  };
};


/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Manager = __webpack_require__(/*! ./manager */ "./manager.js");
const Filter = __webpack_require__(/*! ./filter */ "./filter.js");
const Connection = __webpack_require__(/*! ./connection */ "./connection.js");
const Pool = __webpack_require__(/*! ./pool */ "./pool.js");
const Model = __webpack_require__(/*! ./model */ "./model.js");
const Schema = __webpack_require__(/*! ./schema */ "./schema.js");
const schemas = __webpack_require__(/*! ./schemas */ "./schemas/index.js");
const Query = __webpack_require__(/*! ./query */ "./query.js");

const lib = {
  Manager,
  Connection,
  Model,
  Pool,
  Query,
  Filter,
  Schema,
  schemas,
};

if (typeof window !== 'undefined') {
  window.norm = lib;
}

module.exports = lib;


/***/ }),

/***/ "./manager.js":
/*!********************!*\
  !*** ./manager.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Pool = __webpack_require__(/*! ./pool */ "./pool.js");
const Session = __webpack_require__(/*! ./session */ "./session.js");

class Manager {
  static adapter (ctr) {
    if (typeof ctr === 'function') {
      return ctr;
    }

    throw new Error('Adapter must be a constructor');
  }

  constructor ({ connections = [] } = {}) {
    this.pools = {};
    this.main = '';

    connections.forEach(connection => this.putPool(connection));
  }

  putPool (config) {
    // resolve adapter first before creating
    config.adapter = Manager.adapter(config.adapter);

    let pool = new Pool(config);
    this.pools[pool.name] = pool;
    this.main = config.main ? pool.name : (this.main || pool.name);

    return this;
  }

  /**
   * Getter pool
   *
   * @param {string} name
   * @returns {Pool}
   */
  getPool (name) {
    if (this.main === '') {
      this.putPool({});
    }

    name = `${name || this.main}`;
    if (!this.pools[name]) {
      throw new Error(`Pool '${name}' not found`);
    }

    return this.pools[name];
  }

  async runSession (fn, options) {
    const session = this.openSession(options);
    try {
      const result = await fn(session);
      await session.close();
      await session.dispose();
      return result;
    } catch (err) {
      await session.dispose();
      throw err;
    }
  }

  openSession (options) {
    return new Session({ manager: this });
  }

  async end () {
    await Promise.all(Object.keys(this.pools).map(async name => {
      let pool = this.pools[name];
      await pool.drain();
      await pool.clear();
    }));

    this.pools = {};
  }
}

module.exports = Manager;


/***/ }),

/***/ "./model.js":
/*!******************!*\
  !*** ./model.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

class Model {
  constructor (row) {
    for (let key in row) {
      if (!row.hasOwnProperty(key) || row[key] === undefined) {
        continue;
      }

      this[key] = row[key];
    }
  }
}

module.exports = Model;


/***/ }),

/***/ "./node_modules/async-factory/index.js":
/*!*********************************************!*\
  !*** ./node_modules/async-factory/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

class Space {
  constructor (fn) {
    this.fn = fn;
    this.locks = [];
    this.done = false;
  }

  async fetch () {
    if (!this.done) {
      await new Promise(async (resolve, reject) => {
        this.locks.push([ resolve, reject ]);

        if (this.locks.length > 1) {
          return;
        }

        try {
          let { fn } = this;
          this.value = await fn();
        } catch (err) {
          this.error = err;
        }

        this.done = true;
        this.locks.splice(0).forEach(([ resolve, reject ]) => {
          if (this.error) {
            reject(this.error);
          } else {
            resolve(this.value);
          }
        });
      });
    }

    if (this.error) {
      throw this.error;
    }

    return this.value;
  }
}

class Factory {
  constructor () {
    this.spaces = new Map();
  }

  async singleton (key, fn) {
    fn = fn || key;

    let space;
    if (this.spaces.has(key)) {
      space = this.spaces.get(key);
    } else {
      space = new Space(fn);
      this.spaces.set(key, space);
    }

    return space.fetch(); // return promise
  }
}

module.exports = Factory;


/***/ }),

/***/ "./node_modules/big.js/big.js":
/*!************************************!*\
  !*** ./node_modules/big.js/big.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 *  big.js v5.2.2
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2018 Michael Mclaughlin <M8ch88l@gmail.com>
 *  https://github.com/MikeMcl/big.js/LICENCE
 */
;(function (GLOBAL) {
  'use strict';
  var Big,


/************************************** EDITABLE DEFAULTS *****************************************/


    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places (DP) of the results of operations involving division:
     * div and sqrt, and pow with negative exponents.
     */
    DP = 20,          // 0 to MAX_DP

    /*
     * The rounding mode (RM) used when rounding to the above decimal places.
     *
     *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
     *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
     *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
     *  3  Away from zero.                                  (ROUND_UP)
     */
    RM = 1,             // 0, 1, 2 or 3

    // The maximum value of DP and Big.DP.
    MAX_DP = 1E6,       // 0 to 1000000

    // The maximum magnitude of the exponent argument to the pow method.
    MAX_POWER = 1E6,    // 1 to 1000000

    /*
     * The negative exponent (NE) at and beneath which toString returns exponential notation.
     * (JavaScript numbers: -7)
     * -1000000 is the minimum recommended exponent value of a Big.
     */
    NE = -7,            // 0 to -1000000

    /*
     * The positive exponent (PE) at and above which toString returns exponential notation.
     * (JavaScript numbers: 21)
     * 1000000 is the maximum recommended exponent value of a Big.
     * (This limit is not enforced or checked.)
     */
    PE = 21,            // 0 to 1000000


/**************************************************************************************************/


    // Error messages.
    NAME = '[big.js] ',
    INVALID = NAME + 'Invalid ',
    INVALID_DP = INVALID + 'decimal places',
    INVALID_RM = INVALID + 'rounding mode',
    DIV_BY_ZERO = NAME + 'Division by zero',

    // The shared prototype object.
    P = {},
    UNDEFINED = void 0,
    NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;


  /*
   * Create and return a Big constructor.
   *
   */
  function _Big_() {

    /*
     * The Big constructor and exported function.
     * Create and return a new instance of a Big number object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big(n) {
      var x = this;

      // Enable constructor usage without new.
      if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);

      // Duplicate.
      if (n instanceof Big) {
        x.s = n.s;
        x.e = n.e;
        x.c = n.c.slice();
      } else {
        parse(x, n);
      }

      /*
       * Retain a reference to this Big constructor, and shadow Big.prototype.constructor which
       * points to Object.
       */
      x.constructor = Big;
    }

    Big.prototype = P;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;
    Big.version = '5.2.2';

    return Big;
  }


  /*
   * Parse the number or string value passed to a Big constructor.
   *
   * x {Big} A Big number instance.
   * n {number|string} A numeric value.
   */
  function parse(x, n) {
    var e, i, nl;

    // Minus zero?
    if (n === 0 && 1 / n < 0) n = '-0';
    else if (!NUMERIC.test(n += '')) throw Error(INVALID + 'number');

    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

    // Decimal point?
    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +n.slice(i + 1);
      n = n.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = n.length;
    }

    nl = n.length;

    // Determine leading zeros.
    for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

    if (i == nl) {

      // Zero.
      x.c = [x.e = 0];
    } else {

      // Determine trailing zeros.
      for (; nl > 0 && n.charAt(--nl) == '0';);
      x.e = e - i - 1;
      x.c = [];

      // Convert string to array of digits without leading/trailing zeros.
      for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
    }

    return x;
  }


  /*
   * Round Big x to a maximum of dp decimal places using rounding mode rm.
   * Called by stringify, P.div, P.round and P.sqrt.
   *
   * x {Big} The Big to round.
   * dp {number} Integer, 0 to MAX_DP inclusive.
   * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
   * [more] {boolean} Whether the result of division was truncated.
   */
  function round(x, dp, rm, more) {
    var xc = x.c,
      i = x.e + dp + 1;

    if (i < xc.length) {
      if (rm === 1) {

        // xc[i] is the digit after the digit that may be rounded up.
        more = xc[i] >= 5;
      } else if (rm === 2) {
        more = xc[i] > 5 || xc[i] == 5 &&
          (more || i < 0 || xc[i + 1] !== UNDEFINED || xc[i - 1] & 1);
      } else if (rm === 3) {
        more = more || !!xc[0];
      } else {
        more = false;
        if (rm !== 0) throw Error(INVALID_RM);
      }

      if (i < 1) {
        xc.length = 1;

        if (more) {

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          x.e = -dp;
          xc[0] = 1;
        } else {

          // Zero.
          xc[0] = x.e = 0;
        }
      } else {

        // Remove any digits after the required decimal places.
        xc.length = i--;

        // Round up?
        if (more) {

          // Rounding up may mean the previous digit has to be rounded up.
          for (; ++xc[i] > 9;) {
            xc[i] = 0;
            if (!i--) {
              ++x.e;
              xc.unshift(1);
            }
          }
        }

        // Remove trailing zeros.
        for (i = xc.length; !xc[--i];) xc.pop();
      }
    } else if (rm < 0 || rm > 3 || rm !== ~~rm) {
      throw Error(INVALID_RM);
    }

    return x;
  }


  /*
   * Return a string representing the value of Big x in normal or exponential notation.
   * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
   *
   * x {Big}
   * id? {number} Caller id.
   *         1 toExponential
   *         2 toFixed
   *         3 toPrecision
   *         4 valueOf
   * n? {number|undefined} Caller's argument.
   * k? {number|undefined}
   */
  function stringify(x, id, n, k) {
    var e, s,
      Big = x.constructor,
      z = !x.c[0];

    if (n !== UNDEFINED) {
      if (n !== ~~n || n < (id == 3) || n > MAX_DP) {
        throw Error(id == 3 ? INVALID + 'precision' : INVALID_DP);
      }

      x = new Big(x);

      // The index of the digit that may be rounded up.
      n = k - x.e;

      // Round?
      if (x.c.length > ++k) round(x, n, Big.RM);

      // toFixed: recalculate k as x.e may have changed if value rounded up.
      if (id == 2) k = x.e + n + 1;

      // Append zeros?
      for (; x.c.length < k;) x.c.push(0);
    }

    e = x.e;
    s = x.c.join('');
    n = s.length;

    // Exponential notation?
    if (id != 2 && (id == 1 || id == 3 && k <= e || e <= Big.NE || e >= Big.PE)) {
      s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;

    // Normal notation.
    } else if (e < 0) {
      for (; ++e;) s = '0' + s;
      s = '0.' + s;
    } else if (e > 0) {
      if (++e > n) for (e -= n; e--;) s += '0';
      else if (e < n) s = s.slice(0, e) + '.' + s.slice(e);
    } else if (n > 1) {
      s = s.charAt(0) + '.' + s.slice(1);
    }

    return x.s < 0 && (!z || id == 4) ? '-' + s : s;
  }


  // Prototype/instance methods


  /*
   * Return a new Big whose value is the absolute value of this Big.
   */
  P.abs = function () {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
  };


  /*
   * Return 1 if the value of this Big is greater than the value of Big y,
   *       -1 if the value of this Big is less than the value of Big y, or
   *        0 if they have the same value.
  */
  P.cmp = function (y) {
    var isneg,
      x = this,
      xc = x.c,
      yc = (y = new x.constructor(y)).c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    isneg = i < 0;

    // Compare exponents.
    if (k != l) return k > l ^ isneg ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = -1; ++i < j;) {
      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    }

    // Compare lengths.
    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
  };


  /*
   * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
   * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.div = function (y) {
    var x = this,
      Big = x.constructor,
      a = x.c,                  // dividend
      b = (y = new Big(y)).c,   // divisor
      k = x.s == y.s ? 1 : -1,
      dp = Big.DP;

    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) throw Error(INVALID_DP);

    // Divisor is zero?
    if (!b[0]) throw Error(DIV_BY_ZERO);

    // Dividend is 0? Return +-0.
    if (!a[0]) return new Big(k * 0);

    var bl, bt, n, cmp, ri,
      bz = b.slice(),
      ai = bl = b.length,
      al = a.length,
      r = a.slice(0, bl),   // remainder
      rl = r.length,
      q = y,                // quotient
      qc = q.c = [],
      qi = 0,
      d = dp + (q.e = x.e - y.e) + 1;    // number of digits of the result

    q.s = k;
    k = d < 0 ? 0 : d;

    // Create version of divisor with leading zero.
    bz.unshift(0);

    // Add zeros to make remainder as long as divisor.
    for (; rl++ < bl;) r.push(0);

    do {

      // n is how many times the divisor goes into current remainder.
      for (n = 0; n < 10; n++) {

        // Compare divisor and remainder.
        if (bl != (rl = r.length)) {
          cmp = bl > rl ? 1 : -1;
        } else {
          for (ri = -1, cmp = 0; ++ri < bl;) {
            if (b[ri] != r[ri]) {
              cmp = b[ri] > r[ri] ? 1 : -1;
              break;
            }
          }
        }

        // If divisor < remainder, subtract divisor from remainder.
        if (cmp < 0) {

          // Remainder can't be more than 1 digit longer than divisor.
          // Equalise lengths using divisor with extra leading zero?
          for (bt = rl == bl ? b : bz; rl;) {
            if (r[--rl] < bt[rl]) {
              ri = rl;
              for (; ri && !r[--ri];) r[ri] = 9;
              --r[ri];
              r[rl] += 10;
            }
            r[rl] -= bt[rl];
          }

          for (; !r[0];) r.shift();
        } else {
          break;
        }
      }

      // Add the digit n to the result array.
      qc[qi++] = cmp ? n : ++n;

      // Update the remainder.
      if (r[0] && cmp) r[rl] = a[ai] || 0;
      else r = [a[ai]];

    } while ((ai++ < al || r[0] !== UNDEFINED) && k--);

    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {

      // There can't be more than one zero.
      qc.shift();
      q.e--;
    }

    // Round?
    if (qi > d) round(q, dp, Big.RM, r[0] !== UNDEFINED);

    return q;
  };


  /*
   * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
   */
  P.eq = function (y) {
    return !this.cmp(y);
  };


  /*
   * Return true if the value of this Big is greater than the value of Big y, otherwise return
   * false.
   */
  P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
   * return false.
   */
  P.gte = function (y) {
    return this.cmp(y) > -1;
  };


  /*
   * Return true if the value of this Big is less than the value of Big y, otherwise return false.
   */
  P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
   * return false.
   */
  P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return a new Big whose value is the value of this Big minus the value of Big y.
   */
  P.minus = P.sub = function (y) {
    var i, j, t, xlty,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xc = x.c.slice(),
      xe = x.e,
      yc = y.c,
      ye = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) {

      // y is non-zero? x is non-zero? Or both are zero.
      return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
    }

    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {

      if (xlty = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();
      for (b = a; b--;) t.push(0);
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = ((xlty = xc.length < yc.length) ? xc : yc).length;

      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xlty = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xlty) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }

    /*
     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
     * needs to start at yc.length.
     */
    if ((b = (j = yc.length) - (i = xc.length)) > 0) for (; b--;) xc[i++] = 0;

    // Subtract yc from xc.
    for (b = i; j > a;) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i];) xc[i] = 9;
        --xc[i];
        xc[j] += 10;
      }

      xc[j] -= yc[j];
    }

    // Remove trailing zeros.
    for (; xc[--b] === 0;) xc.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] === 0;) {
      xc.shift();
      --ye;
    }

    if (!xc[0]) {

      // n - n = +0
      y.s = 1;

      // Result must be zero.
      xc = [ye = 0];
    }

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a new Big whose value is the value of this Big modulo the value of Big y.
   */
  P.mod = function (y) {
    var ygtx,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    if (!y.c[0]) throw Error(DIV_BY_ZERO);

    x.s = y.s = 1;
    ygtx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;

    if (ygtx) return new Big(x);

    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;

    return this.minus(x.times(y));
  };


  /*
   * Return a new Big whose value is the value of this Big plus the value of Big y.
   */
  P.plus = P.add = function (y) {
    var t,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.minus(y);
    }

    var xe = x.e,
      xc = x.c,
      ye = y.e,
      yc = y.c;

    // Either zero? y is non-zero? x is non-zero? Or both are zero.
    if (!xc[0] || !yc[0]) return yc[0] ? y : new Big(xc[0] ? x : a * 0);

    xc = xc.slice();

    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }

      t.reverse();
      for (; a--;) t.push(0);
      t.reverse();
    }

    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
      t = yc;
      yc = xc;
      xc = t;
    }

    a = yc.length;

    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (b = 0; a; xc[a] %= 10) b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0

    if (b) {
      xc.unshift(b);
      ++ye;
    }

    // Remove trailing zeros.
    for (a = xc.length; xc[--a] === 0;) xc.pop();

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a Big whose value is the value of this Big raised to the power n.
   * If n is negative, round to a maximum of Big.DP decimal places using rounding
   * mode Big.RM.
   *
   * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
   */
  P.pow = function (n) {
    var x = this,
      one = new x.constructor(1),
      y = one,
      isneg = n < 0;

    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) throw Error(INVALID + 'exponent');
    if (isneg) n = -n;

    for (;;) {
      if (n & 1) y = y.times(x);
      n >>= 1;
      if (!n) break;
      x = x.times(x);
    }

    return isneg ? one.div(y) : y;
  };


  /*
   * Return a new Big whose value is the value of this Big rounded using rounding mode rm
   * to a maximum of dp decimal places, or, if dp is negative, to an integer which is a
   * multiple of 10**-dp.
   * If dp is not specified, round to 0 decimal places.
   * If rm is not specified, use Big.RM.
   *
   * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
   * rm? 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
   */
  P.round = function (dp, rm) {
    var Big = this.constructor;
    if (dp === UNDEFINED) dp = 0;
    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP) throw Error(INVALID_DP);
    return round(new Big(this), dp, rm === UNDEFINED ? Big.RM : rm);
  };


  /*
   * Return a new Big whose value is the square root of the value of this Big, rounded, if
   * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.sqrt = function () {
    var r, c, t,
      x = this,
      Big = x.constructor,
      s = x.s,
      e = x.e,
      half = new Big(0.5);

    // Zero?
    if (!x.c[0]) return new Big(x);

    // Negative?
    if (s < 0) throw Error(NAME + 'No square root');

    // Estimate.
    s = Math.sqrt(x + '');

    // Math.sqrt underflow/overflow?
    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
    if (s === 0 || s === 1 / 0) {
      c = x.c.join('');
      if (!(c.length + e & 1)) c += '0';
      s = Math.sqrt(c);
      e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
      r = new Big((s == 1 / 0 ? '1e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
    } else {
      r = new Big(s);
    }

    e = r.e + (Big.DP += 4);

    // Newton-Raphson iteration.
    do {
      t = r;
      r = half.times(t.plus(x.div(t)));
    } while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''));

    return round(r, Big.DP -= 4, Big.RM);
  };


  /*
   * Return a new Big whose value is the value of this Big times the value of Big y.
   */
  P.times = P.mul = function (y) {
    var c,
      x = this,
      Big = x.constructor,
      xc = x.c,
      yc = (y = new Big(y)).c,
      a = xc.length,
      b = yc.length,
      i = x.e,
      j = y.e;

    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;

    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0]) return new Big(y.s * 0);

    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;

    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
      c = xc;
      xc = yc;
      yc = c;
      j = a;
      a = b;
      b = j;
    }

    // Initialise coefficient array of result with zeros.
    for (c = new Array(j = a + b); j--;) c[j] = 0;

    // Multiply.

    // i is initially xc.length.
    for (i = b; i--;) {
      b = 0;

      // a is yc.length.
      for (j = a + i; j > i;) {

        // Current sum of products at this digit position, plus carry.
        b = c[j] + yc[i] * xc[j - i - 1] + b;
        c[j--] = b % 10;

        // carry
        b = b / 10 | 0;
      }

      c[j] = (c[j] + b) % 10;
    }

    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b) ++y.e;
    else c.shift();

    // Remove trailing zeros.
    for (i = c.length; !c[--i];) c.pop();
    y.c = c;

    return y;
  };


  /*
   * Return a string representing the value of this Big in exponential notation to dp fixed decimal
   * places and rounded using Big.RM.
   *
   * dp? {number} Integer, 0 to MAX_DP inclusive.
   */
  P.toExponential = function (dp) {
    return stringify(this, 1, dp, dp);
  };


  /*
   * Return a string representing the value of this Big in normal notation to dp fixed decimal
   * places and rounded using Big.RM.
   *
   * dp? {number} Integer, 0 to MAX_DP inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   */
  P.toFixed = function (dp) {
    return stringify(this, 2, dp, this.e + dp);
  };


  /*
   * Return a string representing the value of this Big rounded to sd significant digits using
   * Big.RM. Use exponential notation if sd is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * sd {number} Integer, 1 to MAX_DP inclusive.
   */
  P.toPrecision = function (sd) {
    return stringify(this, 3, sd, sd - 1);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Omit the sign for negative zero.
   */
  P.toString = function () {
    return stringify(this);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Include the sign for negative zero.
   */
  P.valueOf = P.toJSON = function () {
    return stringify(this, 4);
  };


  // Export


  Big = _Big_();

  Big['default'] = Big.Big = Big;

  //AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return Big; }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Node and other CommonJS-like environments that support module.exports.
  } else {}
})(this);


/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),

/***/ "./node_modules/generic-pool/index.js":
/*!********************************************!*\
  !*** ./node_modules/generic-pool/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Pool = __webpack_require__(/*! ./lib/Pool */ "./node_modules/generic-pool/lib/Pool.js");
const Deque = __webpack_require__(/*! ./lib/Deque */ "./node_modules/generic-pool/lib/Deque.js");
const PriorityQueue = __webpack_require__(/*! ./lib/PriorityQueue */ "./node_modules/generic-pool/lib/PriorityQueue.js");
const DefaultEvictor = __webpack_require__(/*! ./lib/DefaultEvictor */ "./node_modules/generic-pool/lib/DefaultEvictor.js");
module.exports = {
  Pool: Pool,
  Deque: Deque,
  PriorityQueue: PriorityQueue,
  DefaultEvictor: DefaultEvictor,
  createPool: function(factory, config) {
    return new Pool(DefaultEvictor, Deque, PriorityQueue, factory, config);
  }
};


/***/ }),

/***/ "./node_modules/generic-pool/lib/DefaultEvictor.js":
/*!*********************************************************!*\
  !*** ./node_modules/generic-pool/lib/DefaultEvictor.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class DefaultEvictor {
  evict(config, pooledResource, availableObjectsCount) {
    const idleTime = Date.now() - pooledResource.lastIdleTime;

    if (
      config.softIdleTimeoutMillis < idleTime &&
      config.min < availableObjectsCount
    ) {
      return true;
    }

    if (config.idleTimeoutMillis < idleTime) {
      return true;
    }

    return false;
  }
}

module.exports = DefaultEvictor;


/***/ }),

/***/ "./node_modules/generic-pool/lib/Deferred.js":
/*!***************************************************!*\
  !*** ./node_modules/generic-pool/lib/Deferred.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is apparently a bit like a Jquery deferred, hence the name
 */

class Deferred {
  constructor(Promise) {
    this._state = Deferred.PENDING;
    this._resolve = undefined;
    this._reject = undefined;

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get state() {
    return this._state;
  }

  get promise() {
    return this._promise;
  }

  reject(reason) {
    if (this._state !== Deferred.PENDING) {
      return;
    }
    this._state = Deferred.REJECTED;
    this._reject(reason);
  }

  resolve(value) {
    if (this._state !== Deferred.PENDING) {
      return;
    }
    this._state = Deferred.FULFILLED;
    this._resolve(value);
  }
}

// TODO: should these really live here? or be a seperate 'state' enum
Deferred.PENDING = "PENDING";
Deferred.FULFILLED = "FULFILLED";
Deferred.REJECTED = "REJECTED";

module.exports = Deferred;


/***/ }),

/***/ "./node_modules/generic-pool/lib/Deque.js":
/*!************************************************!*\
  !*** ./node_modules/generic-pool/lib/Deque.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const DoublyLinkedList = __webpack_require__(/*! ./DoublyLinkedList */ "./node_modules/generic-pool/lib/DoublyLinkedList.js");
const DequeIterator = __webpack_require__(/*! ./DequeIterator */ "./node_modules/generic-pool/lib/DequeIterator.js");
/**
 * DoublyLinkedList backed double ended queue
 * implements just enough to keep the Pool
 */
class Deque {
  constructor() {
    this._list = new DoublyLinkedList();
  }

  /**
   * removes and returns the first element from the queue
   * @return {any} [description]
   */
  shift() {
    if (this.length === 0) {
      return undefined;
    }

    const node = this._list.head;
    this._list.remove(node);

    return node.data;
  }

  /**
   * adds one elemts to the beginning of the queue
   * @param  {any} element [description]
   * @return {any}         [description]
   */
  unshift(element) {
    const node = DoublyLinkedList.createNode(element);

    this._list.insertBeginning(node);
  }

  /**
   * adds one to the end of the queue
   * @param  {any} element [description]
   * @return {any}         [description]
   */
  push(element) {
    const node = DoublyLinkedList.createNode(element);

    this._list.insertEnd(node);
  }

  /**
   * removes and returns the last element from the queue
   */
  pop() {
    if (this.length === 0) {
      return undefined;
    }

    const node = this._list.tail;
    this._list.remove(node);

    return node.data;
  }

  [Symbol.iterator]() {
    return new DequeIterator(this._list);
  }

  iterator() {
    return new DequeIterator(this._list);
  }

  reverseIterator() {
    return new DequeIterator(this._list, true);
  }

  /**
   * get a reference to the item at the head of the queue
   * @return {any} [description]
   */
  get head() {
    if (this.length === 0) {
      return undefined;
    }
    const node = this._list.head;
    return node.data;
  }

  /**
   * get a reference to the item at the tail of the queue
   * @return {any} [description]
   */
  get tail() {
    if (this.length === 0) {
      return undefined;
    }
    const node = this._list.tail;
    return node.data;
  }

  get length() {
    return this._list.length;
  }
}

module.exports = Deque;


/***/ }),

/***/ "./node_modules/generic-pool/lib/DequeIterator.js":
/*!********************************************************!*\
  !*** ./node_modules/generic-pool/lib/DequeIterator.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const DoublyLinkedListIterator = __webpack_require__(/*! ./DoublyLinkedListIterator */ "./node_modules/generic-pool/lib/DoublyLinkedListIterator.js");
/**
 * Thin wrapper around an underlying DDL iterator
 */
class DequeIterator extends DoublyLinkedListIterator {
  next() {
    const result = super.next();

    // unwrap the node...
    if (result.value) {
      result.value = result.value.data;
    }

    return result;
  }
}

module.exports = DequeIterator;


/***/ }),

/***/ "./node_modules/generic-pool/lib/DoublyLinkedList.js":
/*!***********************************************************!*\
  !*** ./node_modules/generic-pool/lib/DoublyLinkedList.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A Doubly Linked List, because there aren't enough in the world...
 * this is pretty much a direct JS port of the one wikipedia
 * https://en.wikipedia.org/wiki/Doubly_linked_list
 *
 * For most usage 'insertBeginning' and 'insertEnd' should be enough
 *
 * nodes are expected to something like a POJSO like
 * {
 *   prev: null,
 *   next: null,
 *   something: 'whatever you like'
 * }
 */
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  insertBeginning(node) {
    if (this.head === null) {
      this.head = node;
      this.tail = node;
      node.prev = null;
      node.next = null;
      this.length++;
    } else {
      this.insertBefore(this.head, node);
    }
  }

  insertEnd(node) {
    if (this.tail === null) {
      this.insertBeginning(node);
    } else {
      this.insertAfter(this.tail, node);
    }
  }

  insertAfter(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next === null) {
      this.tail = newNode;
    } else {
      node.next.prev = newNode;
    }
    node.next = newNode;
    this.length++;
  }

  insertBefore(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev === null) {
      this.head = newNode;
    } else {
      node.prev.next = newNode;
    }
    node.prev = newNode;
    this.length++;
  }

  remove(node) {
    if (node.prev === null) {
      this.head = node.next;
    } else {
      node.prev.next = node.next;
    }
    if (node.next === null) {
      this.tail = node.prev;
    } else {
      node.next.prev = node.prev;
    }
    node.prev = null;
    node.next = null;
    this.length--;
  }

  // FIXME: this should not live here and has become a dumping ground...
  static createNode(data) {
    return {
      prev: null,
      next: null,
      data: data
    };
  }
}

module.exports = DoublyLinkedList;


/***/ }),

/***/ "./node_modules/generic-pool/lib/DoublyLinkedListIterator.js":
/*!*******************************************************************!*\
  !*** ./node_modules/generic-pool/lib/DoublyLinkedListIterator.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates an interator for a DoublyLinkedList starting at the given node
 * It's internal cursor will remains relative to the last "iterated" node as that
 * node moves through the list until it either iterates to the end of the list,
 * or the the node it's tracking is removed from the list. Until the first 'next'
 * call it tracks the head/tail of the linked list. This means that one can create
 * an iterator on an empty list, then add nodes, and then the iterator will follow
 * those nodes. Because the DoublyLinkedList nodes don't track their owning "list" and
 * it's highly inefficient to walk the list for every iteration, the iterator won't know
 * if the node has been detached from one List and added to another list, or if the iterator
 *
 * The created object is an es6 compatible iterator
 */
class DoublyLinkedListIterator {
  /**
   * @param  {Object} doublyLinkedList     a node that is part of a doublyLinkedList
   * @param  {Boolean} [reverse=false]     is this a reverse iterator? default: false
   */
  constructor(doublyLinkedList, reverse) {
    this._list = doublyLinkedList;
    // NOTE: these key names are tied to the DoublyLinkedListIterator
    this._direction = reverse === true ? "prev" : "next";
    this._startPosition = reverse === true ? "tail" : "head";
    this._started = false;
    this._cursor = null;
    this._done = false;
  }

  _start() {
    this._cursor = this._list[this._startPosition];
    this._started = true;
  }

  _advanceCursor() {
    if (this._started === false) {
      this._started = true;
      this._cursor = this._list[this._startPosition];
      return;
    }
    this._cursor = this._cursor[this._direction];
  }

  reset() {
    this._done = false;
    this._started = false;
    this._cursor = null;
  }

  remove() {
    if (
      this._started === false ||
      this._done === true ||
      this._isCursorDetached()
    ) {
      return false;
    }
    this._list.remove(this._cursor);
  }

  next() {
    if (this._done === true) {
      return { done: true };
    }

    this._advanceCursor();

    // if there is no node at the cursor or the node at the cursor is no longer part of
    // a doubly linked list then we are done/finished/kaput
    if (this._cursor === null || this._isCursorDetached()) {
      this._done = true;
      return { done: true };
    }

    return {
      value: this._cursor,
      done: false
    };
  }

  /**
   * Is the node detached from a list?
   * NOTE: you can trick/bypass/confuse this check by removing a node from one DoublyLinkedList
   * and adding it to another.
   * TODO: We can make this smarter by checking the direction of travel and only checking
   * the required next/prev/head/tail rather than all of them
   * @return {Boolean}      [description]
   */
  _isCursorDetached() {
    return (
      this._cursor.prev === null &&
      this._cursor.next === null &&
      this._list.tail !== this._cursor &&
      this._list.head !== this._cursor
    );
  }
}

module.exports = DoublyLinkedListIterator;


/***/ }),

/***/ "./node_modules/generic-pool/lib/Pool.js":
/*!***********************************************!*\
  !*** ./node_modules/generic-pool/lib/Pool.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter;

const factoryValidator = __webpack_require__(/*! ./factoryValidator */ "./node_modules/generic-pool/lib/factoryValidator.js");
const PoolOptions = __webpack_require__(/*! ./PoolOptions */ "./node_modules/generic-pool/lib/PoolOptions.js");
const ResourceRequest = __webpack_require__(/*! ./ResourceRequest */ "./node_modules/generic-pool/lib/ResourceRequest.js");
const ResourceLoan = __webpack_require__(/*! ./ResourceLoan */ "./node_modules/generic-pool/lib/ResourceLoan.js");
const PooledResource = __webpack_require__(/*! ./PooledResource */ "./node_modules/generic-pool/lib/PooledResource.js");
const DefaultEvictor = __webpack_require__(/*! ./DefaultEvictor */ "./node_modules/generic-pool/lib/DefaultEvictor.js");
const Deque = __webpack_require__(/*! ./Deque */ "./node_modules/generic-pool/lib/Deque.js");
const Deferred = __webpack_require__(/*! ./Deferred */ "./node_modules/generic-pool/lib/Deferred.js");
const PriorityQueue = __webpack_require__(/*! ./PriorityQueue */ "./node_modules/generic-pool/lib/PriorityQueue.js");
const DequeIterator = __webpack_require__(/*! ./DequeIterator */ "./node_modules/generic-pool/lib/DequeIterator.js");

const reflector = __webpack_require__(/*! ./utils */ "./node_modules/generic-pool/lib/utils.js").reflector;

/**
 * TODO: move me
 */
const FACTORY_CREATE_ERROR = "factoryCreateError";
const FACTORY_DESTROY_ERROR = "factoryDestroyError";

class Pool extends EventEmitter {
  /**
   * Generate an Object pool with a specified `factory` and `config`.
   *
   * @param {typeof DefaultEvictor} Evictor
   * @param {typeof Deque} Deque
   * @param {typeof PriorityQueue} PriorityQueue
   * @param {Object} factory
   *   Factory to be used for generating and destroying the items.
   * @param {Function} factory.create
   *   Should create the item to be acquired,
   *   and call it's first callback argument with the generated item as it's argument.
   * @param {Function} factory.destroy
   *   Should gently close any resources that the item is using.
   *   Called before the items is destroyed.
   * @param {Function} factory.validate
   *   Test if a resource is still valid .Should return a promise that resolves to a boolean, true if resource is still valid and false
   *   If it should be removed from pool.
   * @param {Object} options
   */
  constructor(Evictor, Deque, PriorityQueue, factory, options) {
    super();

    factoryValidator(factory);

    this._config = new PoolOptions(options);

    // TODO: fix up this ugly glue-ing
    this._Promise = this._config.Promise;

    this._factory = factory;
    this._draining = false;
    this._started = false;
    /**
     * Holds waiting clients
     * @type {PriorityQueue}
     */
    this._waitingClientsQueue = new PriorityQueue(this._config.priorityRange);

    /**
     * Collection of promises for resource creation calls made by the pool to factory.create
     * @type {Set}
     */
    this._factoryCreateOperations = new Set();

    /**
     * Collection of promises for resource destruction calls made by the pool to factory.destroy
     * @type {Set}
     */
    this._factoryDestroyOperations = new Set();

    /**
     * A queue/stack of pooledResources awaiting acquisition
     * TODO: replace with LinkedList backed array
     * @type {Deque}
     */
    this._availableObjects = new Deque();

    /**
     * Collection of references for any resource that are undergoing validation before being acquired
     * @type {Set}
     */
    this._testOnBorrowResources = new Set();

    /**
     * Collection of references for any resource that are undergoing validation before being returned
     * @type {Set}
     */
    this._testOnReturnResources = new Set();

    /**
     * Collection of promises for any validations currently in process
     * @type {Set}
     */
    this._validationOperations = new Set();

    /**
     * All objects associated with this pool in any state (except destroyed)
     * @type {Set}
     */
    this._allObjects = new Set();

    /**
     * Loans keyed by the borrowed resource
     * @type {Map}
     */
    this._resourceLoans = new Map();

    /**
     * Infinitely looping iterator over available object
     * @type {DequeIterator}
     */
    this._evictionIterator = this._availableObjects.iterator();

    this._evictor = new Evictor();

    /**
     * handle for setTimeout for next eviction run
     * @type {(number|null)}
     */
    this._scheduledEviction = null;

    // create initial resources (if factory.min > 0)
    if (this._config.autostart === true) {
      this.start();
    }
  }

  _destroy(pooledResource) {
    // FIXME: do we need another state for "in destruction"?
    pooledResource.invalidate();
    this._allObjects.delete(pooledResource);
    // NOTE: this maybe very bad promise usage?
    const destroyPromise = this._factory.destroy(pooledResource.obj);
    const wrappedDestroyPromise = this._Promise.resolve(destroyPromise);

    this._trackOperation(
      wrappedDestroyPromise,
      this._factoryDestroyOperations
    ).catch(reason => {
      this.emit(FACTORY_DESTROY_ERROR, reason);
    });

    // TODO: maybe ensuring minimum pool size should live outside here
    this._ensureMinimum();
  }

  /**
   * Attempt to move an available resource into test and then onto a waiting client
   * @return {Boolean} could we move an available resource into test
   */
  _testOnBorrow() {
    if (this._availableObjects.length < 1) {
      return false;
    }

    const pooledResource = this._availableObjects.shift();
    // Mark the resource as in test
    pooledResource.test();
    this._testOnBorrowResources.add(pooledResource);
    const validationPromise = this._factory.validate(pooledResource.obj);
    const wrappedValidationPromise = this._Promise.resolve(validationPromise);

    this._trackOperation(
      wrappedValidationPromise,
      this._validationOperations
    ).then(isValid => {
      this._testOnBorrowResources.delete(pooledResource);

      if (isValid === false) {
        pooledResource.invalidate();
        this._destroy(pooledResource);
        this._dispense();
        return;
      }
      this._dispatchPooledResourceToNextWaitingClient(pooledResource);
    });

    return true;
  }

  /**
   * Attempt to move an available resource to a waiting client
   * @return {Boolean} [description]
   */
  _dispatchResource() {
    if (this._availableObjects.length < 1) {
      return false;
    }

    const pooledResource = this._availableObjects.shift();
    this._dispatchPooledResourceToNextWaitingClient(pooledResource);
    return false;
  }

  /**
   * Attempt to resolve an outstanding resource request using an available resource from
   * the pool, or creating new ones
   *
   * @private
   */
  _dispense() {
    /**
     * Local variables for ease of reading/writing
     * these don't (shouldn't) change across the execution of this fn
     */
    const numWaitingClients = this._waitingClientsQueue.length;

    // If there aren't any waiting requests then there is nothing to do
    // so lets short-circuit
    if (numWaitingClients < 1) {
      return;
    }

    const resourceShortfall =
      numWaitingClients - this._potentiallyAllocableResourceCount;

    const actualNumberOfResourcesToCreate = Math.min(
      this.spareResourceCapacity,
      resourceShortfall
    );
    for (let i = 0; actualNumberOfResourcesToCreate > i; i++) {
      this._createResource();
    }

    // If we are doing test-on-borrow see how many more resources need to be moved into test
    // to help satisfy waitingClients
    if (this._config.testOnBorrow === true) {
      // how many available resources do we need to shift into test
      const desiredNumberOfResourcesToMoveIntoTest =
        numWaitingClients - this._testOnBorrowResources.size;
      const actualNumberOfResourcesToMoveIntoTest = Math.min(
        this._availableObjects.length,
        desiredNumberOfResourcesToMoveIntoTest
      );
      for (let i = 0; actualNumberOfResourcesToMoveIntoTest > i; i++) {
        this._testOnBorrow();
      }
    }

    // if we aren't testing-on-borrow then lets try to allocate what we can
    if (this._config.testOnBorrow === false) {
      const actualNumberOfResourcesToDispatch = Math.min(
        this._availableObjects.length,
        numWaitingClients
      );
      for (let i = 0; actualNumberOfResourcesToDispatch > i; i++) {
        this._dispatchResource();
      }
    }
  }

  /**
   * Dispatches a pooledResource to the next waiting client (if any) else
   * puts the PooledResource back on the available list
   * @param  {PooledResource} pooledResource [description]
   * @return {Boolean}                [description]
   */
  _dispatchPooledResourceToNextWaitingClient(pooledResource) {
    const clientResourceRequest = this._waitingClientsQueue.dequeue();
    if (
      clientResourceRequest === undefined ||
      clientResourceRequest.state !== Deferred.PENDING
    ) {
      // While we were away either all the waiting clients timed out
      // or were somehow fulfilled. put our pooledResource back.
      this._addPooledResourceToAvailableObjects(pooledResource);
      // TODO: do need to trigger anything before we leave?
      return false;
    }
    const loan = new ResourceLoan(pooledResource, this._Promise);
    this._resourceLoans.set(pooledResource.obj, loan);
    pooledResource.allocate();
    clientResourceRequest.resolve(pooledResource.obj);
    return true;
  }

  /**
   * tracks on operation using given set
   * handles adding/removing from the set and resolve/rejects the value/reason
   * @param  {Promise} operation
   * @param  {Set} set       Set holding operations
   * @return {Promise}       Promise that resolves once operation has been removed from set
   */
  _trackOperation(operation, set) {
    set.add(operation);

    return operation.then(
      v => {
        set.delete(operation);
        return this._Promise.resolve(v);
      },
      e => {
        set.delete(operation);
        return this._Promise.reject(e);
      }
    );
  }

  /**
   * @private
   */
  _createResource() {
    // An attempt to create a resource
    const factoryPromise = this._factory.create();
    const wrappedFactoryPromise = this._Promise.resolve(factoryPromise);

    this._trackOperation(wrappedFactoryPromise, this._factoryCreateOperations)
      .then(resource => {
        this._handleNewResource(resource);
        return null;
      })
      .catch(reason => {
        this.emit(FACTORY_CREATE_ERROR, reason);
        this._dispense();
      });
  }

  _handleNewResource(resource) {
    const pooledResource = new PooledResource(resource);
    this._allObjects.add(pooledResource);
    // TODO: check we aren't exceding our maxPoolSize before doing
    this._dispatchPooledResourceToNextWaitingClient(pooledResource);
  }

  /**
   * @private
   */
  _ensureMinimum() {
    if (this._draining === true) {
      return;
    }
    const minShortfall = this._config.min - this._count;
    for (let i = 0; i < minShortfall; i++) {
      this._createResource();
    }
  }

  _evict() {
    const testsToRun = Math.min(
      this._config.numTestsPerEvictionRun,
      this._availableObjects.length
    );
    const evictionConfig = {
      softIdleTimeoutMillis: this._config.softIdleTimeoutMillis,
      idleTimeoutMillis: this._config.idleTimeoutMillis,
      min: this._config.min
    };
    for (let testsHaveRun = 0; testsHaveRun < testsToRun; ) {
      const iterationResult = this._evictionIterator.next();

      // Safety check incase we could get stuck in infinite loop because we
      // somehow emptied the array after chekcing it's length
      if (iterationResult.done === true && this._availableObjects.length < 1) {
        this._evictionIterator.reset();
        return;
      }
      // if this happens it should just mean we reached the end of the
      // list and can reset the cursor.
      if (iterationResult.done === true && this._availableObjects.length > 0) {
        this._evictionIterator.reset();
        break;
      }

      const resource = iterationResult.value;

      const shouldEvict = this._evictor.evict(
        evictionConfig,
        resource,
        this._availableObjects.length
      );
      testsHaveRun++;

      if (shouldEvict === true) {
        // take it out of the _availableObjects list
        this._evictionIterator.remove();
        this._destroy(resource);
      }
    }
  }

  _scheduleEvictorRun() {
    // Start eviction if set
    if (this._config.evictionRunIntervalMillis > 0) {
      // @ts-ignore
      this._scheduledEviction = setTimeout(() => {
        this._evict();
        this._scheduleEvictorRun();
      }, this._config.evictionRunIntervalMillis);
    }
  }

  _descheduleEvictorRun() {
    if (this._scheduledEviction) {
      clearTimeout(this._scheduledEviction);
    }
    this._scheduledEviction = null;
  }

  start() {
    if (this._draining === true) {
      return;
    }
    if (this._started === true) {
      return;
    }
    this._started = true;
    this._scheduleEvictorRun();
    this._ensureMinimum();
  }

  /**
   * Request a new resource. The callback will be called,
   * when a new resource is available, passing the resource to the callback.
   * TODO: should we add a seperate "acquireWithPriority" function
   *
   * @param {Number} [priority=0]
   *   Optional.  Integer between 0 and (priorityRange - 1).  Specifies the priority
   *   of the caller if there are no available resources.  Lower numbers mean higher
   *   priority.
   *
   * @returns {Promise}
   */
  acquire(priority) {
    if (this._started === false && this._config.autostart === false) {
      this.start();
    }

    if (this._draining) {
      return this._Promise.reject(
        new Error("pool is draining and cannot accept work")
      );
    }

    // TODO: should we defer this check till after this event loop incase "the situation" changes in the meantime
    if (
      this._config.maxWaitingClients !== undefined &&
      this._waitingClientsQueue.length >= this._config.maxWaitingClients
    ) {
      return this._Promise.reject(
        new Error("max waitingClients count exceeded")
      );
    }

    const resourceRequest = new ResourceRequest(
      this._config.acquireTimeoutMillis,
      this._Promise
    );
    this._waitingClientsQueue.enqueue(resourceRequest, priority);
    this._dispense();

    return resourceRequest.promise;
  }

  /**
   * [use method, aquires a resource, passes the resource to a user supplied function and releases it]
   * @param  {Function} fn [a function that accepts a resource and returns a promise that resolves/rejects once it has finished using the resource]
   * @return {Promise}      [resolves once the resource is released to the pool]
   */
  use(fn) {
    return this.acquire().then(resource => {
      return fn(resource).then(
        result => {
          this.release(resource);
          return result;
        },
        err => {
          this.release(resource);
          throw err;
        }
      );
    });
  }

  /**
   * Check if resource is currently on loan from the pool
   *
   * @param {Function} resource
   *    Resource for checking.
   *
   * @returns {Boolean}
   *  True if resource belongs to this pool and false otherwise
   */
  isBorrowedResource(resource) {
    return this._resourceLoans.get(resource) !== undefined;
  }

  /**
   * Return the resource to the pool when it is no longer required.
   *
   * @param {Object} resource
   *   The acquired object to be put back to the pool.
   */
  release(resource) {
    // check for an outstanding loan
    const loan = this._resourceLoans.get(resource);

    if (loan === undefined) {
      return this._Promise.reject(
        new Error("Resource not currently part of this pool")
      );
    }

    this._resourceLoans.delete(resource);
    loan.resolve();
    const pooledResource = loan.pooledResource;

    pooledResource.deallocate();
    this._addPooledResourceToAvailableObjects(pooledResource);

    this._dispense();
    return this._Promise.resolve();
  }

  /**
   * Request the resource to be destroyed. The factory's destroy handler
   * will also be called.
   *
   * This should be called within an acquire() block as an alternative to release().
   *
   * @param {Object} resource
   *   The acquired resource to be destoyed.
   */
  destroy(resource) {
    // check for an outstanding loan
    const loan = this._resourceLoans.get(resource);

    if (loan === undefined) {
      return this._Promise.reject(
        new Error("Resource not currently part of this pool")
      );
    }

    this._resourceLoans.delete(resource);
    loan.resolve();
    const pooledResource = loan.pooledResource;

    pooledResource.deallocate();
    this._destroy(pooledResource);

    this._dispense();
    return this._Promise.resolve();
  }

  _addPooledResourceToAvailableObjects(pooledResource) {
    pooledResource.idle();
    if (this._config.fifo === true) {
      this._availableObjects.push(pooledResource);
    } else {
      this._availableObjects.unshift(pooledResource);
    }
  }

  /**
   * Disallow any new acquire calls and let the request backlog dissapate.
   * The Pool will no longer attempt to maintain a "min" number of resources
   * and will only make new resources on demand.
   * Resolves once all resource requests are fulfilled and all resources are returned to pool and available...
   * Should probably be called "drain work"
   * @returns {Promise}
   */
  drain() {
    this._draining = true;
    return this.__allResourceRequestsSettled()
      .then(() => {
        return this.__allResourcesReturned();
      })
      .then(() => {
        this._descheduleEvictorRun();
      });
  }

  __allResourceRequestsSettled() {
    if (this._waitingClientsQueue.length > 0) {
      // wait for last waiting client to be settled
      // FIXME: what if they can "resolve" out of order....?
      return reflector(this._waitingClientsQueue.tail.promise);
    }
    return this._Promise.resolve();
  }

  // FIXME: this is a horrific mess
  __allResourcesReturned() {
    const ps = Array.from(this._resourceLoans.values())
      .map(loan => loan.promise)
      .map(reflector);
    return this._Promise.all(ps);
  }

  /**
   * Forcibly destroys all available resources regardless of timeout.  Intended to be
   * invoked as part of a drain.  Does not prevent the creation of new
   * resources as a result of subsequent calls to acquire.
   *
   * Note that if factory.min > 0 and the pool isn't "draining", the pool will destroy all idle resources
   * in the pool, but replace them with newly created resources up to the
   * specified factory.min value.  If this is not desired, set factory.min
   * to zero before calling clear()
   *
   */
  clear() {
    const reflectedCreatePromises = Array.from(
      this._factoryCreateOperations
    ).map(reflector);

    // wait for outstanding factory.create to complete
    return this._Promise.all(reflectedCreatePromises).then(() => {
      // Destroy existing resources
      // @ts-ignore
      for (const resource of this._availableObjects) {
        this._destroy(resource);
      }
      const reflectedDestroyPromises = Array.from(
        this._factoryDestroyOperations
      ).map(reflector);
      return this._Promise.all(reflectedDestroyPromises);
    });
  }

  /**
   * How many resources are available to allocated
   * (includes resources that have not been tested and may faul validation)
   * NOTE: internal for now as the name is awful and might not be useful to anyone
   * @return {Number} number of resources the pool has to allocate
   */
  get _potentiallyAllocableResourceCount() {
    return (
      this._availableObjects.length +
      this._testOnBorrowResources.size +
      this._testOnReturnResources.size +
      this._factoryCreateOperations.size
    );
  }

  /**
   * The combined count of the currently created objects and those in the
   * process of being created
   * Does NOT include resources in the process of being destroyed
   * sort of legacy...
   * @return {Number}
   */
  get _count() {
    return this._allObjects.size + this._factoryCreateOperations.size;
  }

  /**
   * How many more resources does the pool have room for
   * @return {Number} number of resources the pool could create before hitting any limits
   */
  get spareResourceCapacity() {
    return (
      this._config.max -
      (this._allObjects.size + this._factoryCreateOperations.size)
    );
  }

  /**
   * see _count above
   * @return {Number} [description]
   */
  get size() {
    return this._count;
  }

  /**
   * number of available resources
   * @return {Number} [description]
   */
  get available() {
    return this._availableObjects.length;
  }

  /**
   * number of resources that are currently acquired
   * @return {Number} [description]
   */
  get borrowed() {
    return this._resourceLoans.size;
  }

  /**
   * number of waiting acquire calls
   * @return {Number} [description]
   */
  get pending() {
    return this._waitingClientsQueue.length;
  }

  /**
   * maximum size of the pool
   * @return {Number} [description]
   */
  get max() {
    return this._config.max;
  }

  /**
   * minimum size of the pool
   * @return {Number} [description]
   */
  get min() {
    return this._config.min;
  }
}

module.exports = Pool;


/***/ }),

/***/ "./node_modules/generic-pool/lib/PoolDefaults.js":
/*!*******************************************************!*\
  !*** ./node_modules/generic-pool/lib/PoolDefaults.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Create the default settings used by the pool
 *
 * @class
 */
class PoolDefaults {
  constructor() {
    this.fifo = true;
    this.priorityRange = 1;

    this.testOnBorrow = false;
    this.testOnReturn = false;

    this.autostart = true;

    this.evictionRunIntervalMillis = 0;
    this.numTestsPerEvictionRun = 3;
    this.softIdleTimeoutMillis = -1;
    this.idleTimeoutMillis = 30000;

    // FIXME: no defaults!
    this.acquireTimeoutMillis = null;
    this.maxWaitingClients = null;

    this.min = null;
    this.max = null;
    // FIXME: this seems odd?
    this.Promise = Promise;
  }
}

module.exports = PoolDefaults;


/***/ }),

/***/ "./node_modules/generic-pool/lib/PoolOptions.js":
/*!******************************************************!*\
  !*** ./node_modules/generic-pool/lib/PoolOptions.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PoolDefaults = __webpack_require__(/*! ./PoolDefaults */ "./node_modules/generic-pool/lib/PoolDefaults.js");

class PoolOptions {
  /**
   * @param {Object} opts
   *   configuration for the pool
   * @param {Number} [opts.max=null]
   *   Maximum number of items that can exist at the same time.  Default: 1.
   *   Any further acquire requests will be pushed to the waiting list.
   * @param {Number} [opts.min=null]
   *   Minimum number of items in pool (including in-use). Default: 0.
   *   When the pool is created, or a resource destroyed, this minimum will
   *   be checked. If the pool resource count is below the minimum, a new
   *   resource will be created and added to the pool.
   * @param {Number} [opts.maxWaitingClients=null]
   *   maximum number of queued requests allowed after which acquire calls will be rejected
   * @param {Boolean} [opts.testOnBorrow=false]
   *   should the pool validate resources before giving them to clients. Requires that either
   *   `factory.validate` or `factory.validateAsync` to be specified.
   * @param {Boolean} [opts.testOnReturn=false]
   *   should the pool validate resources before returning them to the pool.
   * @param {Number} [opts.acquireTimeoutMillis=null]
   *   Delay in milliseconds after which the an `acquire` call will fail. optional.
   *   Default: undefined. Should be positive and non-zero
   * @param {Number} [opts.priorityRange=1]
   *   The range from 1 to be treated as a valid priority
   * @param {Boolean} [opts.fifo=true]
   *   Sets whether the pool has LIFO (last in, first out) behaviour with respect to idle objects.
   *   if false then pool has FIFO behaviour
   * @param {Boolean} [opts.autostart=true]
   *   Should the pool start creating resources etc once the constructor is called
   * @param {Number} [opts.evictionRunIntervalMillis=0]
   *   How often to run eviction checks.  Default: 0 (does not run).
   * @param {Number} [opts.numTestsPerEvictionRun=3]
   *   Number of resources to check each eviction run.  Default: 3.
   * @param {Number} [opts.softIdleTimeoutMillis=-1]
   *   amount of time an object may sit idle in the pool before it is eligible
   *   for eviction by the idle object evictor (if any), with the extra condition
   *   that at least "min idle" object instances remain in the pool. Default -1 (nothing can get evicted)
   * @param {Number} [opts.idleTimeoutMillis=30000]
   *   the minimum amount of time that an object may sit idle in the pool before it is eligible for eviction
   *   due to idle time. Supercedes "softIdleTimeoutMillis" Default: 30000
   * @param {typeof Promise} [opts.Promise=Promise]
   *   What promise implementation should the pool use, defaults to native promises.
   */
  constructor(opts) {
    const poolDefaults = new PoolDefaults();

    opts = opts || {};

    this.fifo = typeof opts.fifo === "boolean" ? opts.fifo : poolDefaults.fifo;
    this.priorityRange = opts.priorityRange || poolDefaults.priorityRange;

    this.testOnBorrow =
      typeof opts.testOnBorrow === "boolean"
        ? opts.testOnBorrow
        : poolDefaults.testOnBorrow;
    this.testOnReturn =
      typeof opts.testOnReturn === "boolean"
        ? opts.testOnReturn
        : poolDefaults.testOnReturn;

    this.autostart =
      typeof opts.autostart === "boolean"
        ? opts.autostart
        : poolDefaults.autostart;

    if (opts.acquireTimeoutMillis) {
      // @ts-ignore
      this.acquireTimeoutMillis = parseInt(opts.acquireTimeoutMillis, 10);
    }

    if (opts.maxWaitingClients) {
      // @ts-ignore
      this.maxWaitingClients = parseInt(opts.maxWaitingClients, 10);
    }

    // @ts-ignore
    this.max = parseInt(opts.max, 10);
    // @ts-ignore
    this.min = parseInt(opts.min, 10);

    this.max = Math.max(isNaN(this.max) ? 1 : this.max, 1);
    this.min = Math.min(isNaN(this.min) ? 0 : this.min, this.max);

    this.evictionRunIntervalMillis =
      opts.evictionRunIntervalMillis || poolDefaults.evictionRunIntervalMillis;
    this.numTestsPerEvictionRun =
      opts.numTestsPerEvictionRun || poolDefaults.numTestsPerEvictionRun;
    this.softIdleTimeoutMillis =
      opts.softIdleTimeoutMillis || poolDefaults.softIdleTimeoutMillis;
    this.idleTimeoutMillis =
      opts.idleTimeoutMillis || poolDefaults.idleTimeoutMillis;

    this.Promise = opts.Promise != null ? opts.Promise : poolDefaults.Promise;
  }
}

module.exports = PoolOptions;


/***/ }),

/***/ "./node_modules/generic-pool/lib/PooledResource.js":
/*!*********************************************************!*\
  !*** ./node_modules/generic-pool/lib/PooledResource.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PooledResourceStateEnum = __webpack_require__(/*! ./PooledResourceStateEnum */ "./node_modules/generic-pool/lib/PooledResourceStateEnum.js");

/**
 * @class
 * @private
 */
class PooledResource {
  constructor(resource) {
    this.creationTime = Date.now();
    this.lastReturnTime = null;
    this.lastBorrowTime = null;
    this.lastIdleTime = null;
    this.obj = resource;
    this.state = PooledResourceStateEnum.IDLE;
  }

  // mark the resource as "allocated"
  allocate() {
    this.lastBorrowTime = Date.now();
    this.state = PooledResourceStateEnum.ALLOCATED;
  }

  // mark the resource as "deallocated"
  deallocate() {
    this.lastReturnTime = Date.now();
    this.state = PooledResourceStateEnum.IDLE;
  }

  invalidate() {
    this.state = PooledResourceStateEnum.INVALID;
  }

  test() {
    this.state = PooledResourceStateEnum.VALIDATION;
  }

  idle() {
    this.lastIdleTime = Date.now();
    this.state = PooledResourceStateEnum.IDLE;
  }

  returning() {
    this.state = PooledResourceStateEnum.RETURNING;
  }
}

module.exports = PooledResource;


/***/ }),

/***/ "./node_modules/generic-pool/lib/PooledResourceStateEnum.js":
/*!******************************************************************!*\
  !*** ./node_modules/generic-pool/lib/PooledResourceStateEnum.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PooledResourceStateEnum = {
  ALLOCATED: "ALLOCATED", // In use
  IDLE: "IDLE", // In the queue, not in use.
  INVALID: "INVALID", // Failed validation
  RETURNING: "RETURNING", // Resource is in process of returning
  VALIDATION: "VALIDATION" // Currently being tested
};

module.exports = PooledResourceStateEnum;


/***/ }),

/***/ "./node_modules/generic-pool/lib/PriorityQueue.js":
/*!********************************************************!*\
  !*** ./node_modules/generic-pool/lib/PriorityQueue.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Queue = __webpack_require__(/*! ./Queue */ "./node_modules/generic-pool/lib/Queue.js");

/**
 * @class
 * @private
 */
class PriorityQueue {
  constructor(size) {
    this._size = Math.max(+size | 0, 1);
    /** @type {Queue[]} */
    this._slots = [];
    // initialize arrays to hold queue elements
    for (let i = 0; i < this._size; i++) {
      this._slots.push(new Queue());
    }
  }

  get length() {
    let _length = 0;
    for (let i = 0, slots = this._slots.length; i < slots; i++) {
      _length += this._slots[i].length;
    }
    return _length;
  }

  enqueue(obj, priority) {
    // Convert to integer with a default value of 0.
    priority = (priority && +priority | 0) || 0;

    if (priority) {
      if (priority < 0 || priority >= this._size) {
        priority = this._size - 1;
        // put obj at the end of the line
      }
    }
    this._slots[priority].push(obj);
  }

  dequeue() {
    for (let i = 0, sl = this._slots.length; i < sl; i += 1) {
      if (this._slots[i].length) {
        return this._slots[i].shift();
      }
    }
    return;
  }

  get head() {
    for (let i = 0, sl = this._slots.length; i < sl; i += 1) {
      if (this._slots[i].length > 0) {
        return this._slots[i].head;
      }
    }
    return;
  }

  get tail() {
    for (let i = this._slots.length - 1; i >= 0; i--) {
      if (this._slots[i].length > 0) {
        return this._slots[i].tail;
      }
    }
    return;
  }
}

module.exports = PriorityQueue;


/***/ }),

/***/ "./node_modules/generic-pool/lib/Queue.js":
/*!************************************************!*\
  !*** ./node_modules/generic-pool/lib/Queue.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const DoublyLinkedList = __webpack_require__(/*! ./DoublyLinkedList */ "./node_modules/generic-pool/lib/DoublyLinkedList.js");
const Deque = __webpack_require__(/*! ./Deque */ "./node_modules/generic-pool/lib/Deque.js");

/**
 * Sort of a internal queue for holding the waiting
 * resource requets for a given "priority".
 * Also handles managing timeouts rejections on items (is this the best place for this?)
 * This is the last point where we know which queue a resourceRequest is in
 *
 */
class Queue extends Deque {
  /**
   * Adds the obj to the end of the list for this slot
   * we completely override the parent method because we need access to the
   * node for our rejection handler
   * @param {any} resourceRequest [description]
   */
  push(resourceRequest) {
    const node = DoublyLinkedList.createNode(resourceRequest);
    resourceRequest.promise.catch(this._createTimeoutRejectionHandler(node));
    this._list.insertEnd(node);
  }

  _createTimeoutRejectionHandler(node) {
    return reason => {
      if (reason.name === "TimeoutError") {
        this._list.remove(node);
      }
    };
  }
}

module.exports = Queue;


/***/ }),

/***/ "./node_modules/generic-pool/lib/ResourceLoan.js":
/*!*******************************************************!*\
  !*** ./node_modules/generic-pool/lib/ResourceLoan.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Deferred = __webpack_require__(/*! ./Deferred */ "./node_modules/generic-pool/lib/Deferred.js");

/**
 * Plan is to maybe add tracking via Error objects
 * and other fun stuff!
 */

class ResourceLoan extends Deferred {
  /**
   *
   * @param  {any} pooledResource the PooledResource this loan belongs to
   * @return {any}                [description]
   */
  constructor(pooledResource, Promise) {
    super(Promise);
    this._creationTimestamp = Date.now();
    this.pooledResource = pooledResource;
  }

  reject() {
    /**
     * Loans can only be resolved at the moment
     */
  }
}

module.exports = ResourceLoan;


/***/ }),

/***/ "./node_modules/generic-pool/lib/ResourceRequest.js":
/*!**********************************************************!*\
  !*** ./node_modules/generic-pool/lib/ResourceRequest.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Deferred = __webpack_require__(/*! ./Deferred */ "./node_modules/generic-pool/lib/Deferred.js");
const errors = __webpack_require__(/*! ./errors */ "./node_modules/generic-pool/lib/errors.js");

function fbind(fn, ctx) {
  return function bound() {
    return fn.apply(ctx, arguments);
  };
}

/**
 * Wraps a users request for a resource
 * Basically a promise mashed in with a timeout
 * @private
 */
class ResourceRequest extends Deferred {
  /**
   * [constructor description]
   * @param  {Number} ttl     timeout
   */
  constructor(ttl, Promise) {
    super(Promise);
    this._creationTimestamp = Date.now();
    this._timeout = null;

    if (ttl !== undefined) {
      this.setTimeout(ttl);
    }
  }

  setTimeout(delay) {
    if (this._state !== ResourceRequest.PENDING) {
      return;
    }
    const ttl = parseInt(delay, 10);

    if (isNaN(ttl) || ttl <= 0) {
      throw new Error("delay must be a positive int");
    }

    const age = Date.now() - this._creationTimestamp;

    if (this._timeout) {
      this.removeTimeout();
    }

    this._timeout = setTimeout(
      fbind(this._fireTimeout, this),
      Math.max(ttl - age, 0)
    );
  }

  removeTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = null;
  }

  _fireTimeout() {
    this.reject(new errors.TimeoutError("ResourceRequest timed out"));
  }

  reject(reason) {
    this.removeTimeout();
    super.reject(reason);
  }

  resolve(value) {
    this.removeTimeout();
    super.resolve(value);
  }
}

module.exports = ResourceRequest;


/***/ }),

/***/ "./node_modules/generic-pool/lib/errors.js":
/*!*************************************************!*\
  !*** ./node_modules/generic-pool/lib/errors.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class ExtendableError extends Error {
  constructor(message) {
    super(message);
    // @ts-ignore
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

/* eslint-disable no-useless-constructor */
class TimeoutError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}
/* eslint-enable no-useless-constructor */

module.exports = {
  TimeoutError: TimeoutError
};


/***/ }),

/***/ "./node_modules/generic-pool/lib/factoryValidator.js":
/*!***********************************************************!*\
  !*** ./node_modules/generic-pool/lib/factoryValidator.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(factory) {
  if (typeof factory.create !== "function") {
    throw new TypeError("factory.create must be a function");
  }

  if (typeof factory.destroy !== "function") {
    throw new TypeError("factory.destroy must be a function");
  }

  if (
    typeof factory.validate !== "undefined" &&
    typeof factory.validate !== "function"
  ) {
    throw new TypeError("factory.validate must be a function");
  }
};


/***/ }),

/***/ "./node_modules/generic-pool/lib/utils.js":
/*!************************************************!*\
  !*** ./node_modules/generic-pool/lib/utils.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function noop() {}

/**
 * Reflects a promise but does not expose any
 * underlying value or rejection from that promise.
 * @param  {Promise} promise [description]
 * @return {Promise}         [description]
 */
exports.reflector = function(promise) {
  return promise.then(noop, noop);
};


/***/ }),

/***/ "./node_modules/koa-compose/index.js":
/*!*******************************************!*\
  !*** ./node_modules/koa-compose/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/uuid/lib/bytesToUuid.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/bytesToUuid.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;


/***/ }),

/***/ "./node_modules/uuid/lib/rng-browser.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/rng-browser.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),

/***/ "./node_modules/uuid/v4.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v4.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "./node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "./node_modules/uuid/lib/bytesToUuid.js");

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),

/***/ "./pool.js":
/*!*****************!*\
  !*** ./pool.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const genericPool = __webpack_require__(/*! generic-pool */ "./node_modules/generic-pool/index.js");
const Schema = __webpack_require__(/*! ./schema */ "./schema.js");

let poolNextId = 0;

class Pool {
  constructor (config) {
    let { name, adapter = __webpack_require__(/*! ./adapters/memory */ "./adapters/memory.js"), schemas = [], min = 1, max = 1 } = config;

    this.name = name || `pool-${poolNextId++}`;
    this.schemas = {};

    schemas.forEach(colOptions => this.putSchema(colOptions));

    const Adapter = adapter;

    Object.defineProperty(this, '_pool', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: genericPool.createPool({
        create () {
          return new Adapter(config);
        },
        async destroy (adapter) {
          if (adapter.end) {
            await adapter.end();
          }
        },
      }, { min, max }),
    });
  }

  putSchema ({ name, fields, observers, modelClass }) {
    let connection = this.name;
    this.schemas[name] = new Schema({ connection, name, fields, observers, modelClass });
    return this;
  }

  /**
   * Getter schema
   *
   * @param {string} name
   */
  getSchema (name) {
    if (!this.schemas[name]) {
      this.putSchema({ name });
    }
    return this.schemas[name];
  }

  acquire (...args) {
    return this._pool.acquire(...args);
  }

  release (...args) {
    return this._pool.release(...args);
  }

  drain (...args) {
    return this._pool.drain(...args);
  }

  clear (...args) {
    return this._pool.clear(...args);
  }
}

module.exports = Pool;


/***/ }),

/***/ "./query.js":
/*!******************!*\
  !*** ./query.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

class Query {
  constructor ({ session, schema, criteria }) {
    this.session = session;

    [ this.connection, this.schema ] = this.session.parseSchema(schema);

    this.find(criteria);

    this.rows = [];
    this.sets = {};
    this.length = -1;
    this.offset = 0;
    this.sorts = undefined;
  }

  find (criteria = {}) {
    this.criteria = typeof criteria === 'object' ? criteria : { id: criteria };

    return this;
  }

  insert (row) {
    this.mode = 'insert';
    this.rows.push(this.schema.attach(row));

    return this;
  }

  sort (sorts) {
    this.sorts = sorts;

    return this;
  }

  limit (length) {
    this.length = length;

    return this;
  }

  skip (offset) {
    this.offset = offset;

    return this;
  }

  set (set) {
    this.mode = 'update';
    this.sets = this.schema.attach(set, true);

    return this;
  }

  async delete ({ observer = true } = {}) {
    this.mode = 'delete';

    let ctx = { query: this };

    if (observer) {
      await this.schema.observe(ctx, ctx => this._delete(ctx));
    } else {
      await this._delete(ctx);
    }

    return ctx.result;
  }

  async _delete () {
    const connection = await this.session.acquire(this.connection);
    let result = await connection.delete(this);
    return result;
  }

  async save ({ filter = true, observer = true } = {}) {
    let ctx = { query: this, filter };

    if (observer) {
      await this.schema.observe(ctx, ctx => this._save(ctx));
    } else {
      await this._save(ctx);
    }

    return this;
  }

  async _save (ctx) {
    const connection = await this.session.acquire(this.connection);
    let { session } = this;
    let { filter } = ctx;

    if (this.rows.length) {
      if (filter) {
        await Promise.all(this.rows.map(row => this.schema.filter(row, { session })));
      }

      let rows = [];
      this.affected = await connection.insert(this, row => rows.push(this.schema.attach(row)));
      this.rows = rows;
    } else {
      if (filter) {
        let partial = true;
        await this.schema.filter(this.sets, { session, partial });
      }

      this.affected = await connection.update(this);
    }
  }

  async drop () {
    const connection = await this.session.acquire(this.connection);
    let result = await connection.drop(this);
    return result;
  }

  async truncate () {
    const connection = await this.session.acquire(this.connection);
    let result = await connection.truncate(this);
    return result;
  }

  async all () {
    let rows = [];
    const connection = await this.session.acquire(this.connection);
    await connection.load(this, row => rows.push(this.schema.attach(row)));
    return rows;
  }

  async count (useSkipAndLimit = false) {
    const connection = await this.session.acquire(this.connection);
    if (typeof connection.count !== 'function') {
      throw new Error('Connection does not implement method count');
    }
    return connection.count(this, useSkipAndLimit);
  }

  async single () {
    let [ row ] = await this.limit(1).all();
    return row;
  }

  getInsertedRows () {
    return this.rows;
  }
}

module.exports = Query;


/***/ }),

/***/ "./schema.js":
/*!*******************!*\
  !*** ./schema.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const FilterError = __webpack_require__(/*! ./errors/filter */ "./errors/filter.js");
const Model = __webpack_require__(/*! ./model */ "./model.js");
const NField = __webpack_require__(/*! ./schemas/nfield */ "./schemas/nfield.js");
const compose = __webpack_require__(/*! koa-compose */ "./node_modules/koa-compose/index.js");

class Schema {
  constructor ({ name, fields = [], observers = [], modelClass = Model }) {
    if (!name) {
      throw new Error('Schema name is required');
    }

    this.name = name;
    this.fields = fields;
    this.observers = [];
    this.modelClass = modelClass;

    observers.forEach(observer => this.addObserver(observer));
  }

  getField (name) {
    return this.fields.find(f => f.name === name) || new NField(name);
  }

  addField (field) {
    let existingField = this.fields.find(f => f.name === field.name);
    if (existingField) {
      return;
    }

    this.fields.push(field);
  }

  addObserver (observer) {
    if ('initialize' in observer) {
      observer.initialize(this);
    }
    this.observers.push(observer);
  }

  attach (row, partial = false) {
    let Model = this.modelClass;

    this.fields.forEach(field => {
      switch (row[field.name]) {
        case undefined:
          if (!partial) {
            row[field.name] = null;
          }
          break;
        case null:
          row[field.name] = null;
          break;
        default:
          row[field.name] = field.attach(row[field.name]);
      }
    });

    return new Model(row);
  }

  observe (ctx, next) {
    if (!this._observerRunner) {
      let units = this.observers.map(observer => {
        return (ctx, next) => {
          if (typeof observer[ctx.query.mode] !== 'function') {
            return next();
          }
          return observer[ctx.query.mode](ctx, next);
        };
      });

      this._observerRunner = compose(units);
    }

    return this._observerRunner(ctx, next);
  }

  async filter (row, { session, partial = false }) {
    const error = new FilterError();

    if (!row) {
      error.add(new Error('Cannot filter empty row'));
      throw error;
    }

    await Promise.all(this.fields.map(async field => {
      try {
        if (partial && row[field.name] === undefined) {
          return;
        }

        row[field.name] = await field.execFilter(row[field.name], { session, row, schema: this });
      } catch (err) {
        err.field = field;
        error.add(err);
      }
    }));

    if (!error.empty()) {
      throw error;
    }

    return row;
  }
}

module.exports = Schema;


/***/ }),

/***/ "./schemas/index.js":
/*!**************************!*\
  !*** ./schemas/index.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  NBoolean: __webpack_require__(/*! ./nboolean */ "./schemas/nboolean.js"),
  NDatetime: __webpack_require__(/*! ./ndatetime */ "./schemas/ndatetime.js"),
  NDouble: __webpack_require__(/*! ./ndouble */ "./schemas/ndouble.js"),
  NField: __webpack_require__(/*! ./nfield */ "./schemas/nfield.js"),
  NInteger: __webpack_require__(/*! ./ninteger */ "./schemas/ninteger.js"),
  NReference: __webpack_require__(/*! ./nreference */ "./schemas/nreference.js"),
  NString: __webpack_require__(/*! ./nstring */ "./schemas/nstring.js"),
  NList: __webpack_require__(/*! ./nlist */ "./schemas/nlist.js"),
  NMap: __webpack_require__(/*! ./nmap */ "./schemas/nmap.js"),
  NBig: __webpack_require__(/*! ./nbig */ "./schemas/nbig.js"),
};


/***/ }),

/***/ "./schemas/nbig.js":
/*!*************************!*\
  !*** ./schemas/nbig.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");
const Big = __webpack_require__(/*! big.js */ "./node_modules/big.js/big.js");

module.exports = class NBig extends NField {
  attach (value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    try {
      return new Big(value);
    } catch (err) {
      // noop
    }

    return null;
  }

  compare (criteria, value) {
    return this.attach(value).cmp(criteria);
  }

  serialize (value) {
    if (!value) {
      return value;
    }

    return value.toJSON();
  }
};


/***/ }),

/***/ "./schemas/nboolean.js":
/*!*****************************!*\
  !*** ./schemas/nboolean.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NBoolean extends NField {
  attach (value) {
    if (value === 'false' || value === '0' || value === '') {
      return false;
    }

    return Boolean(value);
  }
};


/***/ }),

/***/ "./schemas/ndatetime.js":
/*!******************************!*\
  !*** ./schemas/ndatetime.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NDatetime extends NField {
  attach (value) {
    if (!value) {
      return null;
    }

    if (typeof value === 'string' && !isNaN(value)) {
      value = Number(value);
    }

    if (typeof value === 'number') {
      let date = new Date();
      date.setTime(value);
      return date;
    }

    let date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
};


/***/ }),

/***/ "./schemas/ndouble.js":
/*!****************************!*\
  !*** ./schemas/ndouble.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NDouble extends NField {
  attach (value) {
    value = parseFloat(value);

    if (isNaN(value)) {
      return null;
    }

    return value;
  }
};


/***/ }),

/***/ "./schemas/nfield.js":
/*!***************************!*\
  !*** ./schemas/nfield.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Filter = __webpack_require__(/*! ../filter */ "./filter.js");

class NField {
  constructor (name) {
    this.name = name;
    this.rawFilters = [];
    this.filters = [];
  }

  filter (...filters) {
    filters.forEach(filter => {
      try {
        filter = Filter.tokenize(filter);
      } catch (err) {
        // noop
      }

      this.rawFilters.push(filter);
      this.filters.push(Filter.get(filter));
    });

    return this;
  }

  execFilter (value, { session, row, schema }) {
    // when value is string, trim first before filtering
    if (typeof value === 'string') {
      value = value.trim();
    }

    let field = this;
    return this.filters.reduce(
      async (promise, filter) => filter(await promise, { session, row, schema, field }),
      value
    );
  }

  attach (value) {
    return value;
  }

  serialize (value) {
    return value;
  }

  compare (criteria, value) {
    if (typeof criteria === 'number' && typeof value === 'number') {
      return value - criteria;
    }

    if (criteria === value) {
      return 0;
    }

    if (criteria > value) {
      return -1;
    }

    return 1;
  }

  indexOf (criteria, value) {
    return criteria.indexOf(value);
  }
}

module.exports = NField;


/***/ }),

/***/ "./schemas/ninteger.js":
/*!*****************************!*\
  !*** ./schemas/ninteger.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NInteger extends NField {
  attach (value) {
    value = parseInt(value, 10);

    if (isNaN(value)) {
      return null;
    }

    return value;
  }
};


/***/ }),

/***/ "./schemas/nlist.js":
/*!**************************!*\
  !*** ./schemas/nlist.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NList extends NField {
  of (childField) {
    this.childField = childField;

    return this;
  }

  attach (value) {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (err) {
        return null;
      }
    }

    if (!Array.isArray(value)) {
      return null;
    }

    if (this.childField) {
      value = value.map(o => this.childField.attach(o));
    }

    return value;
  }
};


/***/ }),

/***/ "./schemas/nmap.js":
/*!*************************!*\
  !*** ./schemas/nmap.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NMap extends NField {
  attach (value) {
    if (!value) {
      return null;
    }

    try {
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        return value;
      }
    } catch (err) {
      // noop
    }

    return null;
  }

  compare (criteria, value) {
    let criteriaKeys = Object.getOwnPropertyNames(criteria);
    let valueKeys = Object.getOwnPropertyNames(value);

    if (criteriaKeys.length !== valueKeys.length) {
      return 1;
    }

    for (let key of criteriaKeys) {
      if (!valueKeys.includes(key)) {
        return 1;
      }

      if (criteria[key] !== value[key]) {
        return 1;
      }
    }

    return 0;
  }
};


/***/ }),

/***/ "./schemas/nreference.js":
/*!*******************************!*\
  !*** ./schemas/nreference.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NReference extends NField {
  to (to) {
    this.to = to;

    return this;
  }
};


/***/ }),

/***/ "./schemas/nstring.js":
/*!****************************!*\
  !*** ./schemas/nstring.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NField = __webpack_require__(/*! ./nfield */ "./schemas/nfield.js");

module.exports = class NString extends NField {

};


/***/ }),

/***/ "./session.js":
/*!********************!*\
  !*** ./session.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Query = __webpack_require__(/*! ./query */ "./query.js");
const Factory = __webpack_require__(/*! async-factory */ "./node_modules/async-factory/index.js");
const connectionFactory = new Factory();

let sessionNextId = 0;

class Session {
  constructor ({ manager }) {
    this.id = `session-${sessionNextId++}`;
    this.manager = manager;
    this.connections = {};
  }

  factory (schema, criteria) {
    return new Query({ session: this, schema, criteria });
  }

  async acquire (name) {
    let pool = this.manager.getPool(name);

    if (!this.connections[pool.name]) {
      let id = `${this.id}-${pool.name}`;
      this.connections[pool.name] = await connectionFactory.singleton(id, () => pool.acquire());

      await this.connections[pool.name].begin();
    }

    return this.connections[pool.name];
  }

  async dispose () {
    await this.rollback();
    await Promise.all(Object.keys(this.connections).map(name => {
      return this.manager.getPool(name).release(this.connections[name]);
    }));

    this.connections = {};
  }

  close () {
    return this.commit();
  }

  async commit () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.commit();
    }));
  }

  async rollback () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.rollback();
    }));
  }

  async begin () {
    await Promise.all(Object.keys(this.connections).map(async name => {
      let connection = this.connections[name];
      await connection.begin();
    }));
  }

  async flush () {
    await this.commit();
    await this.begin();
  }

  parseSchema (name) {
    let connection;
    let schema;
    if (Array.isArray(name)) {
      if (name.length < 2) {
        throw new Error('Malformed schema name tupple');
      }
      [ connection, schema ] = name;
    } else if (name.indexOf('.') !== -1) {
      [ connection, schema ] = name.split('.');
    } else {
      connection = this.manager.getPool().name;
      schema = name;
    }

    let pool = this.manager.getPool(connection);
    return [ pool.name, pool.getSchema(schema) ];
  }
}

module.exports = Session;


/***/ })

/******/ });
//# sourceMappingURL=norm.js.map