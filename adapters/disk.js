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

  async persist (query) {
    const result = await super.persist(query);

    this.write();

    return result;
  }

  async remove (query) {
    const result = await super.remove(query);

    this.write();

    return result;
  }

  async truncate (query) {
    const result = await super.truncate(query);

    this.write();

    return result;
  }

  write () {
    clearTimeout(this._writing);
    this._writing = setTimeout(() => {
      fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
    }, 500);
  }
}

module.exports = Disk;
