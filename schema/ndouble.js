const NField = require('./nfield');

class NDouble extends NField {
  constructor (name) {
    super(name);

    this.kind = 'double';
  }
}

module.exports = NDouble;
