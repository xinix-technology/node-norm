const NField = require('./nfield');

module.exports = class NInteger extends NField {
  attach (value) {
    return parseInt(value, 10);
  }
};
