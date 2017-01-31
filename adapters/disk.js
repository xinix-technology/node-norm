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

  write () {
    fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
  }
}

module.exports = Disk;
