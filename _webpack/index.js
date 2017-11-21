const Manager = require('node-norm');
const Norm = window.Norm;
const memoryRunner = require('./runners/memory');
const indexeddbRunner = require('./runners/indexeddb');

(async () => {
  console.info('Starting...');

  console.info(`window.Norm equals to require('node-norm')`, Manager === Norm);

  await memoryRunner();
  await indexeddbRunner();

  console.info('Stopped');
})();
