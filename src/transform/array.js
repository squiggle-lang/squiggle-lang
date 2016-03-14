"use strict";

var es = require("../es");

function Array_(transform, node) {
  var pairs = node.data.map(transform);
  var isFrozen = es.Literal(null, node.isFrozen);
  var callee = es.Identifier(null, '$array');
  var args = [isFrozen].concat(pairs);
  return es.CallExpression(node.loc, callee, args);
}

module.exports = Array_;
