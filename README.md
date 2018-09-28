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
