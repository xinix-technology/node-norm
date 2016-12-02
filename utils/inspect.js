'use strict';

module.exports = function(obj, only) {
  let inspect = {};
  only.forEach((k) => {
    inspect[k] = obj[k];
  });

  Object.defineProperty(inspect, 'constructor', {
    enumerable: false, value: obj.constructor,
  });

  return inspect;
};