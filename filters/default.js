module.exports = function def (defaultValue) {
  return function (value = null) {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }

    return value;
  };
};
