(function(root, factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        var _ = require('lodash');

        module.exports = factory(_);
    } else {
        root.norm.model = factory(root._);
    }
})(this, function(_) {
  'use strict';

  return function(attributes, collection) {
    var model = Object.create({
      save: function(options) {
        return collection.save(this, options);
      },
      remove: function(options) {
        return collection.remove(this, options);
      },
      isNew: function() {
        return !this.$id;
      }
    });

    _.merge(model, attributes);

    return model;
  };
});
