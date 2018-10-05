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
/******/ 	return __webpack_require__(__webpack_require__.s = "./observers/actorable.js");
/******/ })
/************************************************************************/
/******/ ({

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
    if (value === null) {
      return value;
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
    if (value === null) {
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
    if (value === null) {
      return value;
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
    if (value === null) {
      return value;
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
    if (!value) {
      return;
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
    if (row[key] === expected && value === null) {
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
    let criteria = { [name]: value };
    let foundRow = await session.factory(schema.name, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} must be unique`);
    }

    return value;
  };
};


/***/ }),

/***/ "./observers/actorable.js":
/*!********************************!*\
  !*** ./observers/actorable.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const NString = __webpack_require__(/*! ../schemas/nstring */ "./schemas/nstring.js");

class Actorable {
  constructor ({
    createdKey = 'created_by',
    updatedKey = 'updated_by',
    userCallback = ctx => ctx.query.session.actor,
  } = {}) {
    this.createdKey = createdKey;
    this.updatedKey = updatedKey;
    this.userCallback = userCallback;
  }

  initialize (schema) {
    schema.addField(new NString(this.createdKey));
    schema.addField(new NString(this.updatedKey));
  }

  async insert (ctx, next) {
    let { query } = ctx;
    query.rows.forEach(row => {
      row[this.createdKey] = row[this.updatedKey] = this.userCallback(ctx);
    });

    await next();
  }

  async update (ctx, next) {
    let { query } = ctx;
    query.sets[this.updatedKey] = this.userCallback(ctx);

    await next();
  }
}

// eslint-disable
if (typeof window !== 'undefined') {
  let norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Actorable = Actorable;
}
// eslint-enable

module.exports = Actorable;


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
}

module.exports = NField;


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


/***/ })

/******/ });
//# sourceMappingURL=actorable.js.map