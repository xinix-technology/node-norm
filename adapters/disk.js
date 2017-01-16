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

  async persist (collection) {
    const row = await super.persist(...arguments);

    this.write();

    return row;
  }

  write () {
    fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
  }
}

module.exports = Disk;
