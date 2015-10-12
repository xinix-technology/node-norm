# node-norm

Node Norm is Javascript port of [Norm](https://github.com/xinix-technology/norm) - The PHP Data access or ORM-like or NOSQL interface to common database server. 

## Features

- Adaptive persistence, currently indexedDB and memory, you can extend easily by creating new adapters 
- Multiple connections to work with
- NoSQL-like approaches
- Data fixtures

## How to work with it

```javascript

var n = norm()
  add('idb', norm.adapters.idb());

var friend = n('Friend').newInstance();
friend.first_name = 'John';
friend.last_name = 'Doe';
friend.save().then(function() {
  console.log('Great, we have new friend');
});

n('Friend').find({'age!gte': 50}).fetch().then(function(oldFriends) {
  console.log('We have ' + oldFriends.length + ' friends');
});
```

if you work with generator on harmony spec, the code is better ;)

```javascript
// jshint esnext: true

var n = norm()
  add('idb', require('norm/lib/adapters/idb')());

var friend = n('Friend').newInstance();
friend.first_name = 'John';
friend.last_name = 'Doe';
yield friend.save();
console.log('Great, we have new friend');

var oldFriends = yield n('Friend').find({'age!gte': 50}).fetch();
console.log('We have ' + oldFriends.length + ' friends');

```

## Data fixtures

TBD

## Something we've missed from Norm

- Schema, will be implemented soon ;)

## Running test on browser

You can run test from web browser or node.js by using jasmine.
To run on web browser, put url to SpecRunner.html of your project directory.

## Running test on node.js 

To run on node.js, run following commands on terminal

```
npm install -g jasmine
cd $PROJECT_DIR
jasmine
```
