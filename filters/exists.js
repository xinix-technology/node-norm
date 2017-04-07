module.exports = function exists (schema, key = 'id') {
  return async function (value, { tx, field: { name } }) {
    let criteria = {};
    criteria[key] = value;

    if (!(await tx.factory(schema, criteria).single())) {
      throw new Error(`Field ${name} must be exists`);
    }

    return value;
  };
};
