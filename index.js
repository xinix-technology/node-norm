const Manager = require('./manager');

if (typeof window !== 'undefined') {
  Manager.Connection = require('./connection');
  window.Norm = Manager;
}

module.exports = Manager;
