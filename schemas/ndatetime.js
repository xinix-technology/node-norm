const NField = require('./nfield');

module.exports = class NDatetime extends NField {
  attach (value) {
    value = super.attach(value);

    if (value === null) {
      return null;
    }

    if (typeof value === 'string' && !isNaN(value)) {
      value = Number(value);
    }

    if (typeof value === 'number') {
      const date = new Date();
      date.setTime(value);
      return date;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid datetime value');
    }

    return date;
  }
};
