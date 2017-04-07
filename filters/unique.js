module.exports = function unique (schema) {
  return async function (value, { row, tx, field: { name } }) {
    let criteria = {};
    criteria[name] = value;

    let foundRow = await tx.factory(schema, criteria).single();
    if (foundRow && foundRow.id !== row.id) {
      throw new Error(`Field ${name} already exists`);
    }

    return value;
  };
};
