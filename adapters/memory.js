'use strict';

const uuid = require('node-uuid');
const Connection = require('../connection');

class Memory extends Connection {

  get data() {
    return this.options.data;
  }

  set data(data) {
    this.options.data = data;
  }

  constructor(repository, id, options) {
    super(repository, id, options);

    this.data = this.options.data || {};
  }

  persist(collectionId, row) {
    return new Promise(function (resolve, reject) {
      if (!row.$id) {
        row.$id = uuid.v1();
      }

      // marshall row
      var data = this.data[collectionId] = this.data[collectionId] || [];
      var foundIndex;
      if (data.some((drow, index) => {
          if (drow.$id === row.$id) {
            foundIndex = index;
            return true;
          }
        })) {
        data[foundIndex] = row;
      } else {
        data.push(row);
      }

      // unmarshall row
      resolve(row);
    }.bind(this));
  }

  remove(cursor) {
    return this.fetch(cursor).then(function(rows) {
      var data = this.data[cursor.collection.id] = this.data[cursor.collection.id] || [];

      rows.forEach(function (row) {
        data.some((drow, index) => {
            if (drow.$id === row.$id) {
              data.splice(index, 1);
              return true;
            }
          });
      }.bind(this));
    }.bind(this));
  }

  matchCriteria(criteria, row) {
    if (!criteria) {
      return true;
    }

    for(var i in criteria) {
      if (criteria[i] !== row[i]) {
        return false;
      }
    }
    return true;
  }

  fetch(cursor) {
    return new Promise(function(resolve, reject) {
      var data = this.data[cursor.collection.id] || [];
      var rows = [];
      var limit = cursor.limit;
      var skip = cursor.skip;

      for(let row of data) {
        if (skip) {
          skip--;
        } else {
          if (this.matchCriteria(cursor.criteria, row)) {
            if (limit !== -1) {
              if (limit <= 0) {
                break;
              }
              limit--;
            }

            rows.push(row);
          }
        }
      }
      resolve(rows);
    }.bind(this));
  }

}

module.exports = Memory;
// (function(root, factory) {
//     'use strict';

//     if (typeof module !== 'undefined' && module.exports) {
//         var uuid = require('node-uuid');
//         var _ = require('lodash');

//         module.exports = factory(uuid, _);
//     } else {
//         root.norm.adapters.memory = factory(root.uuid, root._);
//     }
// })(this, function(uuid, _) {
//   'use strict';

//   var memoryAdapter = function(options) {
//     return {
//       persist: function(collection, model) {
//         this.data = this.data || {};
//         this.data[collection.id] = this.data[collection.id] || [];

//         if (!model.$id) {
//           model.$id = uuid.v1();
//           this.data[collection.id].push(model);
//         } else {
//           var row = _.find(this.data[collection.id], function(row) {
//             return row.$id === model.$id;
//           });
//           _.merge(row, model);
//         }
//         return Promise.resolve(model);
//       },

//       remove: function(collection, model) {
//         this.data = this.data || {};
//         this.data[collection.id] = this.data[collection.id] || [];

//         for(var i in this.data[collection.id]) {
//           var row = this.data[collection.id][i];

//           if (row.$id === model.$id) {
//             this.data[collection.id].splice(i, 1);
//             break;
//           }
//         }

//         return Promise.resolve();
//       },

//       query: function(cursor, options) {
//         this.data = this.data || {};
//         this.data[cursor.collection.id] = this.data[cursor.collection.id] || [];

//         var criteria = cursor.criteria || {};
//         var results = [];
//         var maxLimit = cursor.limit();
//         for(var i in this.data[cursor.collection.id]) {
//           if (maxLimit <= 0) {
//             break;
//           }
//           var row = this.data[cursor.collection.id][i];
//           var caught = _.some(criteria, function(v, i) {
//             var x = i.split('!');
//             var k = x[0];
//             var op = x[1] || 'eq';
//             switch(op) {
//               case 'eq':
//                 if (row[k] !== v) {
//                   return true;
//                 }
//                 break;
//               default:
//                 throw new Error('Unimplemented');
//             }
//           });
//           if (!caught) {
//             maxLimit--;
//             results.push(row);
//           }
//         }
//         return Promise.resolve(results);
//       }
//     };
//   };

//   return memoryAdapter;
// });