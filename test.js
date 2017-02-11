const Kefir = require('kefir');

(async () => {
  let stream = Kefir.sequentially(100, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  let x = await stream.toPromise();

  console.log(x);
})();
