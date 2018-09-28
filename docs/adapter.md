# Adapter

## Implement new adapter

Create connection class extends from `Connection` and implement methods below.

```js
const Connection = require('node-norm/connection')

class FooAdapter extends Connection {
  // implement methods below
}
```

### Mandatory methods

`#load (query, callback = () => {})`

`#insert (query, callback = () => {})`

`#update (query)`

`#drop (query)`

`#truncate (query)`

`#delete (query)`

`#count (query, useSkipAndLimit)`

Return value: Number

### Optional methods

`#_begin ()`

`#_commit ()`

`#_rollback ()`
