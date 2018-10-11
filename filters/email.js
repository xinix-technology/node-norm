module.exports = function email () {
  return function (value = null, { field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    value = value.toLowerCase();

    let err = new Error(`Field ${name} must be valid email`);

    const parts = value.split('@');

    if (parts.length !== 2) {
      throw err;
    }

    const domain = parts.pop();
    let user = parts.join('@');

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      user = user.replace(/\./g, '').toLowerCase();
    }

    if (user.length > 64 || domain.length > 256) {
      throw err;
    }

    return value;
  };
};
