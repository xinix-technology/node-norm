module.exports = function unique () {
  return async function (value, { row, session, schema, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let criteria = { [name]: value };
    let foundRow = await session.factory(schema.name, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} must be unique`);
    }

    return value;
  };
};
