module.exports = function (...enums) {
  return function (value = null, { field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    if (enums.indexOf(value) === -1) {
      throw new Error(`Field ${name} out of enum range`);
    }

    return value;
  };
};
