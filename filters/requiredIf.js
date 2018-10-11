module.exports = function requiredIf (key, expected) {
  return function (value = null, { session, row, field: { name = 'unknown' } }) {
    if (row[key] === expected && (value === null || value === '')) {
      throw new Error(`Field ${name} is required`);
    }

    return value;
  };
};
