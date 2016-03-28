var __ = require("./__internal");

function first(ary) {
  __.argN(1);
  return __.aArray1(ary)[0];
}

function rest(ary) {
  __.argN(1);
  return __.freeze(__.aArray1(ary).slice(1));
}

function last(ary) {
  __.argN(1);
  var n = __.aArray1(ary).length;
  return ary[n - 1];
}

function slice(ary, start, end) {
  __.argN(3);
  __.aArray(ary);
  __.aInteger(start);
  __.aInteger(end);
  if (end === -1) {
    return __.freeze(ary.slice(start));
  } else {
    return __.freeze(ary.slice(start, end + 1));
  }
}

function enumerate(ary) {
  __.argN(1);
  __.aArray(ary);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    xs.push(__.freeze([i, ary[i]]));
  }
  return __.freeze(xs);
}

function all(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  for (var i = 0; i < ary.length; i++) {
    if (!__.aBoolean(f(ary[i]))) {
      return false;
    }
  }
  return true;
}

function any(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  for (var i = 0; i < ary.length; i++) {
    if (__.aBoolean(f(ary[i]))) {
      return true;
    }
  }
  return false;
}

function foldLeft(ary, init, f) {
  __.argN(3);
  __.aArray(ary);
  __.aFunc(f);
  for (var i = 0; i < ary.length; i++) {
    init = f(init, ary[i]);
  }
  return init;
}

function foldRight(ary, init, f) {
  __.argN(3);
  __.aArray(ary);
  __.aFunc(f);
  for (var i = ary.length - 1; i >= 0; i--) {
    init = f(ary[i], init);
  }
  return init;
}

function reduce(ary, f) {
  __.argN(2);
  __.aArray1(ary);
  return foldLeft(ary.slice(1), ary[0], __.aFunc(f));
}

function map(ary, f) {
  __.aArray(ary);
  __.aFunc(f);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    xs.push(f(ary[i]));
  }
  return __.freeze(xs);
}

function mapN(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    xs.push(f.apply(null, ary[i]));
  }
  return __.freeze(xs);
}

function flatten(ary) {
  __.argN(1);
  __.aArray(ary);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    xs.push.apply(xs, __.aArray(ary[i]));
  }
  return __.freeze(xs);
}

function flatMap(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    xs.push.apply(xs, __.aArray(f(ary[i])));
  }
  return __.freeze(xs);
}

function filter(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  var xs = [];
  for (var i = 0; i < ary.length; i++) {
    if (__.aBoolean(f(ary[i]))) {
      xs.push(ary[i]);
    }
  }
  return __.freeze(xs);
}

function forEach(ary, f) {
  __.argN(2);
  __.aArray(ary);
  __.aFunc(f);
  for (var i = 0; i < ary.length; i++) {
    f(ary[i]);
  }
  return undefined;
}

function zip(ary1, ary2) {
  __.argN(2);
  __.aArray(ary1);
  __.aArray(ary2);
  if (ary1.length !== ary2.length) {
    throw new Error("cannot zip unequal length arrays: " + ary1 + ", " + ary2);
  }
  var xs = [];
  for (var i = 0; i < ary1.length; i++) {
    xs.push(__.freeze([ary1[i], ary2[i]]));
  }
  return __.freeze(xs);
}

function contains(ary, x) {
  __.argN(2);
  // TODO: Needs Op.is
  throw new Error("not implemented");
}

function sortWith(ary, f) {
  __.argN(2);
  return __.aArray(ary).slice().sort(__.aFunc(f));
}

function fromArrayLike(ary) {
  __.argN(1);
  if (ary && __.aInteger(ary.length)) {
    var xs = [];
    for (var i = 0; i < ary.length; i++) {
      xs.push(ary[i]);
    }
    return __.freeze(xs);
  }
  throw new Error("cannot convert non-arraylike to array: " + ary);
}

function of_() {
  return fromArrayLike(arguments);
}

function copy(ary) {
  __.argN(1);
  return fromArrayLike(__.aArray(ary));
}

function get(ary, i, f) {
  __.argN(3);
  __.aArray(ary);
  __.aInteger(i);
  __.aFunc(f);
  if (i < 0) {
    i += ary.length;
  }
  if (0 <= i && i < ary.length) {
    return ary[i];
  } else {
    return f();
  }
}

exports.first = first;
exports.rest = rest;
exports.last = last;
exports.slice = slice;
exports.enumerate = enumerate;
exports.all = all;
exports.any = any;
exports.foldLeft = foldLeft;
exports.foldRight = foldRight;
exports.reduce = reduce;
exports.map = map;
exports.mapN = mapN;
exports.flatten = flatten;
exports.flatMap = flatMap;
exports.filter = filter;
exports.forEach = forEach;
exports.zip = zip;
exports.contains = contains;
exports.sortWith = sortWith;
exports.fromArrayLike = fromArrayLike;
exports.of = of_;
exports.copy = copy;
exports.get = get;
