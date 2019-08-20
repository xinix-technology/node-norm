let filters = {};

class Filter {
  static tokenize (signature) {
    if (typeof signature !== 'string') {
      throw new Error('Cannot tokenize non-string filter signature');
    }

    let [head, ...rest] = signature.split(':');
    rest = rest.join(':');
    rest = rest.length === 0 ? [] : rest.split(',');

    return [head, ...rest];
  }

  static get (signature) {
    const signatureType = typeof signature;

    if (signatureType === 'function') {
      return signature;
    }

    if (signatureType === 'string') {
      signature = Filter.tokenize(signature);
    }

    if (!Array.isArray(signature)) {
      throw new Error(`Unknown filter by ${signatureType}`);
    }

    const [fn, ...args] = signature;

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
      } catch (err) {
        // noop
      }
      throw new Error(`Filter ${fn} not found <${signatureType}(${normalizedSignature})>`);
    }

    return filters[fn](...args);
  }

  static put (name, filter) {
    filters[name] = filter;
  }

  static reset () {
    filters = {};
  }
}

module.exports = Filter;
