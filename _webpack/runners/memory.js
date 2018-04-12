const assert = require('assert');
const Manager = require('node-norm');

module.exports = async function () {
  console.group('Memory runner (default)'); // eslint-disable-line no-console

  let manager = new Manager({
    connections: [
      {
        data: {
          user: [
            { id: 1, username: 'foo' },
            { id: 2, username: 'bar' },
            { id: 3, username: 'baz' },
          ],
        },
      },
    ],
  });

  await manager.runSession(async session => {
    let users = await session.factory('user').all();
    console.info('Fixture users', users.length);
    assert.equal(users.length, 3);

    console.info('Insert new user');
    await session.factory('user').insert({ username: 'jafar' }).save();

    users = await session.factory('user').all();
    console.info('Users', users.length);
    assert.equal(users.length, 4);
  });

  console.groupEnd(); // eslint-disable-line no-console
};
