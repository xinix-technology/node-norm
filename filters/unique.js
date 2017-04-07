module.exports = function unique (schema) {
  return async function (value, { tx, field: { name } }) {
    let criteria = {};
    criteria[name] = value;

    if (await tx.factory(schema, criteria).single()) {
      throw new Error(`Field ${name} already exists`);
    }

    return value;
  };
};
