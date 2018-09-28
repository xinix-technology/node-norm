# node-norm

node-norm is intermediate layer to access data source (database, file, else?).

```sh
npm i node-norm
```

## Features

- Adaptive persistence, you can easily extend by creating new adapters,
- Multiple connections to work with,
- NoSQL-like approaches,
- ~~Data fixtures~~.

## How to work with it

```js
const { Manager } = require('node-norm');
const manager = new Manager({
  connections: [
    {
      name: 'default',
      adapter: Disk, // change with constructor of adapter
      schemas: [
        {
          name: 'friend',
        }
      ],
    },
  ],
})

(async () => {
  let session = manager.openSession();

  try {
    let friend = { first_name: 'John', last_name: 'Doe' };

    await session.factory('foo.friend').insert(friend).save();
    // same as
    await session.factory('friend').insert(friend).save();
    // same as
    await session.factory(['foo', 'friend']).insert(friend).save();
    
    let data = await session.factory('foo', { bar: 'foobar' }).single();
    //similiar with syntax: SELECT * FROM foo where bar = 'foobar' LIMIT 1 ;
    let data = await session.factory('foo', { bar: 'foobar' }).all();
    let data = await session.factory('foo').find({ bar: 'foobar' }).all();
    //similiar with syntax: SELECT * FROM foo where bar = 'foobar' ;
    let data = await session.factory('foo').all();
    //similiar with syntax: SELECT * FROM foo;
    let data = await session.factory('foo').find({ userId: 1, 'userName!like': 'foo' }).all();
    // on example userName separate by !, you can use 'or', 'lt', 'gt' 
    //similiar with syntax: SELECT * FROM foo where userId = 1 and userName LIKE %foo%;
    let { inserted, rows } = await session.factory('foo').insert({ field1: 'bar', field2: 'baz' }).save();
                             await session.factory('foo').insert({ field1: 'bar', field2: 'baz' }).insert({ field1: 'bar1' }).save();
    // insert data to table foo
    let { affected } = await session.factory('foo',{ barId = 2 }).set({ baz: 'bar' }).save();
    // edit record on field barId = 2

    let data = await session.factory('foo').delete();
    //delete data;
  
    console.log('Great, we have new friend');

    let newFriend = await session.factory('friend').single();

    await session.close();
  } catch (err) {
    console.error(err);
  }

  await session.dispose();

  // or

  manager.runSession((session) => {
    let friend = { first_name: 'John', last_name: 'Doe' };

    await session.factory('friend').insert(friend).save();

    console.log('Great, we have new friend');

    let newFriend = await session.factory('friend').single();
  });
})();
```

## Documentation

- [Adapter](docs/adapter.md)
- [Schema](docs/schema.md)
- [API](docs/api.md)
