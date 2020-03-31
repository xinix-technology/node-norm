const Memory = require('./memory');
const fs = require('fs-extra');

class Disk extends Memory {
  constructor (options) {
    super(options);

    this.file = options.file || './.tmp/db.json';
  }

  async insert (query, callback = () => {}) {
    const result = await super.insert(query, callback);
    return result;
  }

  async update (query) {
    const result = await super.update(query);
    return result;
  }

  async drop (query) {
    const result = await super.drop(query);
    return result;
  }

  async truncate (query) {
    const result = await super.truncate(query);
    return result;
  }

  async delete (query) {
    const result = await super.delete(query);
    return result;
  }

  _begin () {
    try {
      fs.ensureFileSync(this.file);
      this.data = JSON.parse(fs.readFileSync(this.file));
    } catch (err) {
      this.data = {};
    }
  }

  _commit () {
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }
}

module.exports = Disk;
