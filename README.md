# node-norm

node-norm is intermediate layer to access data source (database, file, else?).

## Features

- Adaptive persistence, you can easily extend by creating new adapters,
- Multiple connections to work with,
- NoSQL-like approaches,
- Data fixtures.

## How to work with it

```javascript

const manager = require('node-norm')();

(async () => {
  let friend = { first_name: 'John', last_name: 'Doe' };

  await manager.find('friend').insert(friend).save();

  console.log('Great, we have new friend');

  await manager.find('friend').single();
})();

const friend = norm.Factory('Friend').newInstance();
friend
    .set({
        'first_name': 'John',
        'last_name': 'Doe',
    })
    .save()
        .then(function() {
        });

norm.Factory('Friend')
    .find({ 'age!gte': 50 })
    .fetch()
        .then(function(oldFriends) {
            console.log('We have ' + oldFriends.length + ' friends');
        });
```

if you work with co generator, the code is better ;)

```javascript
// jshint esnext: true

const norm = require('norm');
const factory = norm.Factory('Friend');

co(function *() {
    const friend = factory.newInstance();
    friend.set({
        'first_name': 'John',
        'last_name': 'Doe',
    });
    yield friend.save();

    console.log('Great, we have new friend');

    const oldFriends = yield factory.find({'age!gte': 50}).fetch();

    console.log(`We have ${oldFriends.length} friends`);
});

```

## Data fixtures

TBD

## Something we've missed from Norm

- Schema, will be implemented soon ;)

## Running test on browser

For now node-norm only support server side with Node.JS

## Running test on node.js

TBD
