const NField = require('./nfield');

module.exports = class NReference extends NField {
  to (to) {
    this.to = to;

    return this;
  }
};
