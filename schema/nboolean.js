const NField = require('./nfield');

class NBoolean extends NField {
  constructor (name) {
    super(name);

    this.kind = 'boolean';
  }
}

module.exports = NBoolean;
