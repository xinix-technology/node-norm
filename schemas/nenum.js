const NField = require('./nfield');

module.exports = class NEnum extends NField {
  constructor (name) {
    super(name);

    this.enumTo = [];
  }

  to (enumTo) {
    this.enumTo = enumTo;

    return this;
  }

  attach (value) {
    if (!value) {
      return;
    }

    return this.enumTo.find(v => v === value);
  }
};
