const NField = require('./nfield');

class NInteger extends NField {
  constructor (name) {
    super(name);

    this.kind = 'integer';
  }
}

module.exports = NInteger;
