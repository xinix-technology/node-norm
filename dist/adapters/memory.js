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
/******/ 	return __webpack_require__(__webpack_require__.s = "./adapters/memory.js");
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
      for (const k in qRow) { // eslint-disable-line no-unused-vars
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

    query.offset = offset; // eslint-disable-line require-atomic-updates
    query.length = length; // eslint-disable-line require-atomic-updates

    return count;
  }

  _matchCriteria (criteria, row, schema) {
    if (!criteria) {
      return true;
    }

    for (const key in criteria) { // eslint-disable-line no-unused-vars
      const critValue = criteria[key];
      const [nkey, op = 'eq'] = key.split('!');
      const field = schema.getField(nkey);
      const rowValue = row[nkey];
      switch (op) {
        case 'or': {
          let valid = false;
          for (const subCriteria of critValue) { // eslint-disable-line no-unused-vars
            const match = this._matchCriteria(subCriteria, row, schema);
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
          for (const subCriteria of critValue) { // eslint-disable-line no-unused-vars
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
}

if (typeof window !== 'undefined') {
  const norm = window.norm;
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


/***/ })

/******/ });
//# sourceMappingURL=memory.js.map