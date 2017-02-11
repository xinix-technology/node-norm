const NField = require('./nfield');

class NReference extends NField {
  constructor (name) {
    super(name);

    this.kind = 'reference';
  }

  to (to) {
    this.to = to;

    return this;
  }
}

module.exports = NReference;
