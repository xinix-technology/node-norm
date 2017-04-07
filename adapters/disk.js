const Memory = require('./memory');
const fs = require('fs-promise');

class Disk extends Memory {
  constructor (options) {
    super(options);

    this.file = options.file || './.tmp/db.json';

    try {
      fs.ensureFileSync(this.file);
      this.data = JSON.parse(fs.readFileSync(this.file));
    } catch (err) {}
  }

  async insert (query, callback = () => {}) {
    let result = await super.insert(query, callback);
    this._write();
    return result;
  }

  async update (query) {
    let result = await super.update(query);
    this._write();
    return result;
  }

  async drop (query) {
    let result = await super.drop(query);
    this._write();
    return result;
  }

  async truncate (query) {
    let result = await super.truncate(query);
    this._write();
    return result;
  }

  async delete (query) {
    let result = await super.delete(query);
    this._write();
    return result;
  }

  _write () {
    clearTimeout(this._writing);
    this._writing = setTimeout(() => {
      fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
    }, 500);
  }
}

module.exports = Disk;
