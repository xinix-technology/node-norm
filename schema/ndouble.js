const NField = require('./nfield');

module.exports = class NDouble extends NField {
  attach (value) {
    return parseFloat(value);
  }
};
