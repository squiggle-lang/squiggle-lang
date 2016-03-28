var __ = require("./__internal");

function map(obj, f) {
  __.argN(2);
  __.aObject(obj);
  __.aFunc(f);
  var ks = Object.keys(obj);
  var out = {};
  for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    out[k] = f(obj[k]);
  }
  return __.freeze(out);
}

function transform(obj, f) {
  __.argN(2);
  __.aObject(obj);
  __.aFunc(f);
  var ks = Object.keys(obj);
  var out = {};
  for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    out[k] = f(k, obj[k]);
  }
  return __.freeze(out);
}

function toPairs(obj) {
  __.argN(1);
  __.aObject(obj);
  var ks = Object.keys(obj);
  var xs = [];
  for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    xs.push(__.freeze([k, obj[k]]));
  }
  return __.freeze(xs);
}

function fromPairs(ary) {
  __.argN(2);
  __.aArray(ary);
  var out = {};
  for (var i = 0; i < ary.length; i++) {
    var pair = __.aArray(ary[i]);
    if (pair.length !== 2) {
      throw new Error("not a valid pair: " + pair);
    }
    var k = pair[0];
    var v = pair[1];
    out[k] = v;
  }
  return __.freeze(out);
}

function copy(obj) {
  __.argN(1);
  return fromPairs(toPairs(obj));
}

function get(obj, key, f) {
  __.argN(3);
  // TODO: Implement Op.has
  throw new Error("not implemented");
}

exports.map = map;
exports.transform = transform;
exports.toPairs = toPairs;
exports.fromPairs = fromPairs;
exports.copy = copy;
exports.get = get;
