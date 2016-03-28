"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function Not(transform, node) {
  var expr = transform(node.expr);
  var not = helperNamed("not");
  return es.CallExpression(null, not, [expr]);
}

module.exports = Not;
