const NField = require('./nfield');

module.exports = class NList extends NField {
  of (childField) {
    this.childField = childField;

    return this;
  }

  attach (value) {
    value = super.attach(value);
    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (err) {
        throw new Error('Invalid list value');
      }
    }

    if (!Array.isArray(value)) {
      throw new Error('Invalid list value');
    }

    if (this.childField) {
      value = value.map(o => this.childField.attach(o));
    }

    return value;
  }
};
