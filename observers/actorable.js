class Actorable {

}

if (typeof window !== 'undefined') {
  let norm = window.norm;
  if (!norm) {
    throw new Error('Norm is not defined yet!');
  }

  norm.observers = norm.observers || {};
  norm.observers.Actorable = Actorable;
}

module.exports = Actorable;
