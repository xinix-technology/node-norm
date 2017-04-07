module.exports = function required () {
  return function (value = null, { field: { name = 'unknown' } }) {
    if (value === null || value === '') {
      throw new Error(`Field ${name} is required`);
    }

    return value;
  };
};
