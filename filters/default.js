module.exports = function def (defaultValue) {
  return function (value = null) {
    if (value === null) {
      return defaultValue;
    }

    return value;
  };
};
