module.exports = function unique (schema) {
  return async function (value, { row, session, field: { name } }) {
    let criteria = {};
    criteria[name] = value;

    let foundRow = await session.factory(schema, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} already exists`);
    }

    return value;
  };
};
