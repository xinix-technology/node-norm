const filters = {};

class Filter {
  static get (signature) {
    let signatureType = typeof signature;
    let err = new Error(`Unimplemented get filter by ${signatureType}`);
    let fn = '';
    let args = [];
    switch (signatureType) {
      case 'string':
        signature = signature.split(':');
        [ fn, ...args ] = signature;
        args = args.join(':').split(',');
        break;
      case 'object':
        if (!Array.isArray(signature)) {
          throw err;
        } else {
          signatureType = 'array';
          [ fn, ...args ] = signature;
        }
        break;
      case 'function':
        return signature;
      default:
        throw err;
    }

    if (fn in filters === false) {
      try {
        filters[fn] = require('./filters/' + fn);
      } catch (err) {
        filters[fn] = null;
      }
    }

    if (!filters[fn]) {
      let normalizedSignature = 'unknown';
      try {
        normalizedSignature = JSON.stringify(signature);
      } catch (err) {};
      throw new Error(`Filter ${fn} not found <${signatureType}(${normalizedSignature})>`);
    }

    return filters[fn](...args);
  }

  static register (name, filter) {
    filters[name] = filter;
  }

  static put (name, filter) {
    filters[name] = filter;
  }
}

module.exports = Filter;
