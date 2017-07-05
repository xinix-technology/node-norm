
class Connection {
  constructor ({ name }) {
    this.name = name;
  }

  initialize () {
    // do nothing
  }

  begin () {
    // console.log('begin');
  }

  commit () {
    // console.log('commit');
  }

  rollback () {
    // console.log('rollback');
  }
}

module.exports = Connection;
