const NField = require('./nfield');

class NReference extends NField {
  to (to) {
    this.to = to;

    return this;
  }
}

module.exports = NReference;
