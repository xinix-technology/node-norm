# node-norm

node-norm is intermediate layer to access data source (database, file, else?).

```sh
npm i node-norm
```

## Features

- Adaptive persistence, you can easily extend by creating new adapters,
- Multiple connections to work with,
- NoSQL-like approaches,
- Data fixtures.

## How to work with it

```javascript

const Manager = require('node-norm');
const manager = new Manager({
  connections: [
    {
      name: 'default',
      adapter: 'disk',
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
    await session.factory('foo.friend').insert(friend).save(); // same as
    await session.factory('friend').insert(friend).save(); // same as
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

## Classes

### Manager

Manager manages multiple connections and sessions into single application context.

#### #openSession()

Create new session

#### #runSession(fn)

Run session by function

### Session

Session manages single connection context

#### #factory(schemaName, criteria = {})

Create new query by its schema name

### Connection

Connection is single connection to data source

#### #put()
#### #get()
#### #factory()
#### #initialize()

### Schema

You may see schema is a single table or collection.

#### #attach()
#### #filter()

### Field

Field defines single property of schema. The `id` property does not have to be added as field and will be implicitly added.

#### #filter()

### Query

To load or persist data to data source, query object works as context of single request.

### Operators

- or
- and
- eq
- ne
- gt
- gte
- lt
- lte
- in
- nin
- regex
- like
- where: use function as determinator

#### #find()
#### #insert()
#### #set()
#### #save()
#### #skip()
#### #limit()
#### #sort()
#### #delete()
#### #truncate()
#### #drop()
#### #all()
#### #single()
#### #count(useSkipAndLimit = false)
