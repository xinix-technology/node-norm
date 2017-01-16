const Manager = require('./manager');

module.exports = (options) => {
  const manager = new Manager(options);

  return async (ctx, next) => {
    ctx.state.norm = manager;

    await next();
  }
};
