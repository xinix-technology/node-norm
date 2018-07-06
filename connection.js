class Connection {
  constructor ({ name }) {
    this.name = name;
    this._hasTx = false;
  }

  async begin () {
    if (this._hasTx) {
      return;
    }

    await this._begin();

    this._hasTx = true;
  }

  async commit () {
    if (!this._hasTx) {
      return;
    }

    await this._commit();
    this._hasTx = false;
  }

  async rollback () {
    if (!this._hasTx) {
      return;
    }

    await this._rollback();
    this._hasTx = false;
  }

  _begin () {
    // do nothing
  }

  _commit () {
    // do nothing
  }

  _rollback () {
    // do nothing
  }
}

module.exports = Connection;
