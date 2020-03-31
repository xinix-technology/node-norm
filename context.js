class Context {
  constructor ({ query, filter }) {
    this.query = query;
    this.filter = filter;
  }

  get session () {
    return this.query.session;
  }

  get mode () {
    return this.query.mode;
  }

  get state () {
    return this.session.state;
  }

  get manager () {
    return this.session.manager;
  }
}

module.exports = Context;
