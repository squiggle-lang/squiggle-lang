"use strict";

var flatten = require("lodash/array/flatten");

var es = require("../es");
var helperNamed = require("../helper-named");

function pairToArray(pair) {
  return [pair.key, pair.value];
}

function Object_(transform, node) {
  var pairs = node.data.map(pairToArray);
  var isFrozen = es.Literal(null, node.isFrozen);
  var args = [isFrozen].concat(flatten(pairs).map(transform));
  var id = helperNamed("object");
  return es.CallExpression(node.loc, id, args);
}

module.exports = Object_;
