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

if (typeof window !== 'undefined') {
  window.Norm = lib;
}

module.exports = lib;
