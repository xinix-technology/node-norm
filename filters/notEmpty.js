module.exports = function notEmpty () {
  return function (value, { field: { name } }) {
    if (!value || (Array.isArray(value) && value.length)) {
      throw new Error(`Field ${name} must not empty`);
    }

    return value;
  };
};
