module.exports = function requiredIf (key, expected) {
  return function (value = null, { tx, row, field: { name = 'unknown' } }) {
    if (row[key] === expected && value === null) {
      throw new Error(`Field ${name} is required`);
    }

    return value;
  };
};
