"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function Negate(transform, node) {
  var expr = transform(node.expr);
  if (node.expr.type === "Number") {
    return es.UnaryExpression(node.loc, true, "-", transform(node.expr));
  } else {
    var negate = helperNamed("negate");
    return es.CallExpression(null, negate, [expr]);
  }
}

module.exports = Negate;
