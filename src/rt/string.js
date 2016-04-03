var __ = require("./__internal");

function upperCase(s) {
  __.argN(1, arguments.length);
  return __.aString(s).toUpperCase();
}

function lowerCase(s) {
  __.argN(1, arguments.length);
  return __.aString(s).toLowerCase();
}

function trim(s) {
  __.argN(1, arguments.length);
  return __.aString(s).trim();
}

function startsWith(s, other) {
  __.argN(2, arguments.length);
  throw new Error("not implemented");
}

function endsWith(s, other) {
  __.argN(2, arguments.length);
  throw new Error("not implemented");
}

function split(s, sep) {
  __.argN(2, arguments.length);
  return __.aString(s).split(__.aString(sep));
}

function contains(s, sub) {
  __.argN(2, arguments.length);
  return __.aString(s).indexOf(__.aString(sub)) >= 0;
}

function slice(s, start, end) {
  __.argN(3, arguments.length);
  // TODO: Make it like array.slice
  throw new Error("not implemented");
}

function replaceAll(s, a, b) {
  __.argN(3, arguments.length);
  throw new Error("not implemented");
}

function replaceAllWith(s, a, f) {
  __.argN(3, arguments.length);
  throw new Error("not implemented");
}

function format(s, data) {
  __.argN(2, arguments.length);
  throw new Error("not implemented");
}

exports.upperCase = upperCase;
exports.lowerCase = lowerCase;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.split = split;
exports.contains = contains;
exports.trim = trim;
exports.slice = slice;
exports.replaceAll = replaceAll;
exports.replaceAllWith = replaceAllWith;
exports.format = format;
