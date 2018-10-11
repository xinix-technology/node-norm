module.exports = function def (defaultValue) {
  return function (value = null) {
    if (!value) {
      return defaultValue;
    }

    return value;
  };
};
