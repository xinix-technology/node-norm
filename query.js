const Context = require('./context');

class Query {
  constructor ({ session, connection, schema, criteria }) {
    this.session = session;

    this.connection = connection;
    this.schema = schema;

    this.find(criteria);

    this.rows = [];
    this.sets = {};
    this.length = -1;
    this.offset = 0;
    this.sorts = undefined;
  }

  clone () {
    const query = new Query(this);
    query.length = this.length;
    query.offset = this.offset;
    query.sorts = this.sorts;
    return query;
  }

  find (criteria = {}) {
    this.criteria = typeof criteria === 'object' ? criteria : { id: criteria };

    return this;
  }

  insert (row) {
    this.mode = 'insert';
    this.rows.push(this.schema.attach(row));

    return this;
  }

  sort (sorts) {
    this.sorts = sorts;

    return this;
  }

  limit (length) {
    this.length = length;

    return this;
  }

  skip (offset) {
    this.offset = offset;

    return this;
  }

  set (set) {
    this.mode = 'update';
    this.sets = this.schema.attach(set, true);

    return this;
  }

  async delete ({ observer = true } = {}) {
    this.mode = 'delete';

    const conDelete = async () => {
      const connection = await this.session.acquire(this.connection);
      const result = await connection.delete(this);
      return result;
    };

    const ctx = new Context({ query: this });

    if (observer) {
      await this.schema.observe(ctx, ctx => conDelete(ctx));
    } else {
      await conDelete(ctx);
    }

    return ctx.result;
  }

  async save ({ filter = true, observer = true } = {}) {
    const ctx = new Context({ query: this, filter });

    const conSave = async (ctx) => {
      const connection = await this.session.acquire(this.connection);
      const { session } = this;
      const { filter } = ctx;

      if (this.mode === 'insert') {
        if (this.rows.length === 0) {
          throw new Error('Failed to insert empty rows');
        }

        if (filter) {
          await Promise.all(this.rows.map(row => this.schema.filter(row, { session })));
        }

        const rows = [];
        this.affected = await connection.insert(this, row => rows.push(this.schema.attach(row)));
        this.rows = rows;
        return;
      }

      if (this.mode === 'update') {
        if (Object.keys(this.sets).length === 0) {
          throw new Error('Failed to update empty set');
        }

        if (filter) {
          const partial = true;
          await this.schema.filter(this.sets, { session, partial });
        }

        if (Object.keys(this.sets).length === 0) {
          throw new Error('Neither insert and update to save');
        }

        this.affected = await connection.update(this);
        return;
      }

      throw new Error(`Invalid mode=${this.mode} to save`);
    };

    if (observer) {
      await this.schema.observe(ctx, ctx => conSave(ctx));
    } else {
      await conSave(ctx);
    }

    return this;
  }

  async drop () {
    const connection = await this.session.acquire(this.connection);
    const result = await connection.drop(this);
    return result;
  }

  async truncate () {
    const connection = await this.session.acquire(this.connection);
    const result = await connection.truncate(this);
    return result;
  }

  async all () {
    const rows = [];
    const connection = await this.session.acquire(this.connection);
    await connection.load(this, row => rows.push(this.schema.attach(row)));
    return rows;
  }

  async count (useSkipAndLimit = false) {
    const connection = await this.session.acquire(this.connection);
    if (typeof connection.count !== 'function') {
      throw new Error('Connection does not implement count()');
    }
    return connection.count(this, useSkipAndLimit);
  }

  async single () {
    const [row] = await this.limit(1).all();
    return row;
  }

  async defined () {
    const connection = await this.session.acquire(this.connection);
    if (typeof connection.defined !== 'function') {
      throw new Error('Connection does not implement defined()');
    }
    return connection.defined(this.schema);
  }

  async define () {
    const connection = await this.session.acquire(this.connection);
    if (typeof connection.define !== 'function') {
      throw new Error('Connection does not implement define()');
    }
    return connection.define(this.schema);
  }

  async undefine () {
    const connection = await this.session.acquire(this.connection);
    if (typeof connection.undefine !== 'function') {
      throw new Error('Connection does not implement undefine()');
    }
    return connection.undefine(this.schema);
  }
}

module.exports = Query;
