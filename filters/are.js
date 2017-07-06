module.exports = function (schema) {
  return async function (value = null, { session, field: { name } }) {
    if (value === null) {
      return value;
    }

    let err = new Error(`Field ${name} values must be ${schema}`);

    if (!Array.isArray(value)) {
      throw err;
    }

    try {
      let schemaO = session.getSchema(schema);
      await Promise.all(value.map(async row => await schemaO.filter(row, { session })));
      value = value.map(row => schemaO.attach(row));
    } catch (err) {
      console.error(`Caught error at nested model, ${err.stack}`);
      throw new Error(`Field ${name} must be compatible to '${schema}'`);
    }

    return value;
  };
};
