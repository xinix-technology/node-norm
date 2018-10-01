module.exports = function exists (schema, key = 'id') {
  return async function (value, { session, field: { name } }) {
    if (!value) {
      return;
    }

    let criteria = {};
    criteria[key] = value;

    if (!(await session.factory(schema, criteria).single())) {
      throw new Error(`Field ${name} must be exists`);
    }

    return value;
  };
};
