module.exports = function notExists (schema) {
  return async function (value, { row, session, field: { name } }) {
    if (value === null || value === '') {
      return null;
    }

    let criteria = { [name]: value };
    let foundRow = await session.factory(schema, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} already exists in ${schema}`);
    }

    return value;
  };
};
