const Manager = require('./manager');
const Filter = require('./filter');
const Connection = require('./connection');
const Pool = require('./pool');
const Model = require('./model');
const Schema = require('./schema');
const schemas = require('./schemas');
const Query = require('./query');

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

/* istanbul ignore if */
if (typeof window !== 'undefined') {
  window.norm = lib;
}

module.exports.Manager = Manager;
module.exports.Connection = Connection;
module.exports.Model = Model;
module.exports.Pool = Pool;
module.exports.Query = Query;
module.exports.Filter = Filter;
module.exports.Schema = Schema;
