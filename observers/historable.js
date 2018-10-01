class Historable {
  constructor ({ suffix = '_history' } = {}) {
    this.suffix = suffix;
  }

  async insert (ctx, next) {
    let { query } = ctx;
    let { session } = query;
    let historySchema = `${query.schema.name}${this.suffix}`;
    let now = new Date();

    await next();

    let historyQuery = session.factory(historySchema);
    query.rows.forEach(row => {
      historyQuery = historyQuery.insert({ row_id: row.id, action: 'insert', created: now });
    });
    await historyQuery.save();
  }

  async update (ctx, next) {
    let { query } = ctx;
    let { session } = query;
    let historySchema = `${query.schema.name}${this.suffix}`;
    let now = new Date();

    let affectedRows = await session.factory(query.schema.name, query.criteria).all();

    await next();

    let historyQuery = session.factory(historySchema);
    affectedRows.forEach(row => {
      historyQuery = historyQuery.insert({ row_id: row.id, action: 'update', created: now });
    });
    await historyQuery.save();
  }

  async delete (ctx, next) {
    let { query } = ctx;
    let { session } = query;
    let historySchema = `${query.schema.name}${this.suffix}`;
    let now = new Date();

    let affectedRows = await session.factory(query.schema.name, query.criteria).all();

    await next();

    let historyQuery = session.factory(historySchema);
    affectedRows.forEach(row => {
      historyQuery = historyQuery.insert({ row_id: row.id, action: 'delete', created: now });
    });
    await historyQuery.save();
  }
}

// eslint-disable
if (typeof window !== 'undefined') {
  let norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Historable = Historable;
}
// eslint-enable

module.exports = Historable;
