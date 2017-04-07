module.exports = function (...enums) {
  return function (value = null, { field: { name } }) {
    if (value === null) {
      return value;
    }

    if (enums.indexOf(value) === -1) {
      throw new Error(`Field ${name} out of enum range`);
    }

    return value;
  };
};
