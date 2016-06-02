# node-norm

node-norm is Javascript port of [Norm](https://github.com/xinix-technology/norm) - The data access or ORM-like or NOSQL interface to common database server. 

## Features

- Adaptive persistence, currently memory, you can extend easily by creating new adapters,
- Multiple connections to work with,
- NoSQL-like approaches,
- Data fixtures.

## How to work with it

```javascript

var norm = require('norm');

var friend = norm.Factory('Friend').newInstance();
friend
    .set({
        'first_name': 'John',
        'last_name': 'Doe',
    })
    .save()
        .then(function() {
            console.log('Great, we have new friend');
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
    var friend = factory.newInstance();
    friend.set({
        'first_name': 'John',
        'last_name': 'Doe',
    });
    yield friend.save();

    console.log('Great, we have new friend');

    var oldFriends = yield factory.find({'age!gte': 50}).fetch();

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