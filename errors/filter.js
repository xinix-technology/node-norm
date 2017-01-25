class Filter extends Error {
  constructor () {
    super();

    this.children = [];
  }

  get message () {
    return this.children.map(child => child.message).join(', ');
  }

  add (value) {
    this.children.push(value);
  }

  empty () {
    return this.children.length === 0;
  }
}

module.exports = Filter;
