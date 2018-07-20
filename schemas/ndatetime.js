const NField = require('./nfield');

module.exports = class NDatetime extends NField {
  attach (value) {
    let date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
};
