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

  async persist (...args) {
    const result = await super.persist(...args);

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
