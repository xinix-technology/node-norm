const { Pool } = require('../..');
const assert = require('assert');
const { NString } = require('../../schemas');

describe('Schema', () => {
  it('define schemas by pool constructor', () => {
    const pool = new Pool({
      name: 'foo',
      schemas: [
        {
          name: 'bar',
          fields: [
            new NString('baz').filter('default:baz'),
          ],
        },
      ],
    });

    assert.strictEqual(pool.getSchema('bar').name, 'bar');
    assert.strictEqual(pool.getSchema('bar').fields[0].name, 'baz');
    assert.strictEqual(pool.getSchema('bar').fields[0].filters.length, 1);
  });
});
