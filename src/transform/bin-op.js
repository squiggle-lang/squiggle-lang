"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

var table = {
  "*": "multiply",
  "/": "divide",
  "+": "add",
  "-": "subtract",
  "++": "concat",
  "..": "strcat",
  "~": "update",
  ">=": "gte",
  "<=": "lte",
  "<": "lt",
  ">": "gt",
  "==": "eq",
  has: "has",
  is: "is",
  "!=": "neq"
};

var boolTable = {
  and: "&&",
  or: "||"
};

function bool(x) {
  return es.CallExpression(x.loc, helperNamed("aBoolean"), [x]);
}

function BinOp(transform, node) {
  var d = node.operator.data;
  // `and` and `or` cannot be implemented as functions due to short circuiting
  // `behavior, so they work differently.
  var left;
  var right;
  if (d === 'and' || d === 'or') {
    var op = boolTable[d];
    // var left = transform(bool(node.left));
    // var right = transform(bool(node.right));
    left = bool(transform(node.left));
    right = bool(transform(node.right));
    return es.LogicalExpression(node.operator.loc, op, left, right);
  } else {
    var f = helperNamed(table[node.operator.data]);
    left = transform(node.left);
    right = transform(node.right);
    return es.CallExpression(f.loc, f, [left, right]);
  }
}

module.exports = BinOp;
