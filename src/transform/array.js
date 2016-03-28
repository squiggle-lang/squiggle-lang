"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function Array_(transform, node) {
  var pairs = node.data.map(transform);
  var isFrozen = es.Literal(null, node.isFrozen);
  var callee = helperNamed("array");
  var args = [isFrozen].concat(pairs);
  return es.CallExpression(node.loc, callee, args);
}

module.exports = Array_;
