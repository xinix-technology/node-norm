(function(root, factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        var _ = require('lodash');

        module.exports = factory(_);
    } else {
        root.norm.connection = factory(root._);
    }
})(this, function(_) {
  'use strict';

  var connectionModule = function(id, adapter) {
    var connection = Object.create({
      persist: function() {
        throw new Error('Please override persist');
      },
      fetch: function() {
        throw new Error('Please override fetch');
      },
      remove: function() {
        throw new Error('Please override remove');
      },
      inspect: function() {
        return 'Connection(id: ' + id + ')';
      }
    });

    _.merge(connection, adapter);

    return connection;
  };

  return connectionModule;

});