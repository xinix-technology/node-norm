const kTx = Symbol('tx');

class Connection {
  constructor ({ name }) {
    this.name = name;
    this[kTx] = false;
  }

  async begin () {
    /* istanbul ignore if */
    if (this[kTx]) {
      return;
    }

    await this._begin();

    this[kTx] = true;
  }

  async commit () {
    /* istanbul ignore if */
    if (!this[kTx]) {
      return;
    }

    await this._commit();
    this[kTx] = false;
  }

  async rollback () {
    /* istanbul ignore if */
    if (!this[kTx]) {
      return;
    }

    await this._rollback();
    this[kTx] = false;
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
