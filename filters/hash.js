const crypto = require('crypto');

module.exports = function hash (salt) {
  return function (value) {
    return crypto.createHash('md5').update(`${value || ''}${salt || ''}`).digest('hex');
  };
};
