"use strict";

var es = require("../es");

function Not(transform, node) {
  var expr = transform(node.expr);
  var not = es.Identifier(node.loc, "$not");
  return es.CallExpression(null, not, [expr]);
}

module.exports = Not;
