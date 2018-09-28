const NField = require('./nfield');

module.exports = class NList extends NField {
  of (childField) {
    this.childField = childField;

    return this;
  }

  attach (value) {
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (err) {
        return;
      }
    }

    if (!Array.isArray(value)) {
      return;
    }

    if (this.childField) {
      value = value.map(o => this.childField.attach(o));
    }

    return value;
  }
};
