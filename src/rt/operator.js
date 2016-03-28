var __ = require("./__internal");

function and(a, b) {
  __.argN(2);
  return __.aBoolean(a) && __.aBoolean(b);
}

function or(a, b) {
  __.argN(2);
  return __.aBoolean(a) || __.aBoolean(b);
}

exports.add = __.add;
exports.and = and;
exports.arrayGet = __.arrayGet;
exports.concat = __.concat;
exports.divide = __.divide;
exports.eq = __.eq;
exports.gt = __.gt;
exports.gte = __.gte;
exports.has = __.has;
exports.is = __.is;
exports.lt = __.lt;
exports.lte = __.lte;
exports.multiply = __.multiply;
exports.negate = __.negate;
exports.neq = __.neq;
exports.not = __.not;
exports.objectGet = __.objectGet;
exports.or = or;
exports.strcat = __.strcat;
exports.subtract = __.subtract;
exports.update = __.update;
