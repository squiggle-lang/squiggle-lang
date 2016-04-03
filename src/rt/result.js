var __ = require("./__internal");

function map() {
  throw new Error("not implemented");
}

function mapN() {
  throw new Error("not implemented");
}

function try_(fn) {
  __.argN(1, arguments.length);
  __.aFunc(fn);
  try {
    return ["rt.Result.Ok", fn()];
  } catch (err) {
    return ["rt.Result.Fail", err];
  }
}

function catch_() {
  throw new Error("not implemented");
}

exports.map = map;
exports.mapN = mapN;
exports.try = try_;
exports.catch = catch_;
