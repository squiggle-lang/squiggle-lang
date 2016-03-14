"use strict";

var esprima = require("esprima");

var es = require("../es");

function frozenArray(xs) {
  var fn = es.Identifier(null, "$array");
  var args = [es.Literal(null, true)].concat(xs);
  return es.CallExpression(null, fn, args);
}

function Try(transform, node) {
  var expr = transform(node.expr);
  var ok = frozenArray([
    es.Literal(null, "ok"),
    expr,
  ]);
  var fail = frozenArray([
    es.Literal(null, "fail"),
    es.Identifier(null, "$error")
  ]);
  var catch_ = es.CatchClause(
    null,
    es.Identifier(null, "$error"),
    es.BlockStatement(null, [
      es.ReturnStatement(null, fail)
    ])
  );
  var retBlock = es.BlockStatement(null, [
    es.ReturnStatement(null, ok)
  ]);
  var internalError = esprima.parse(
    "throw new Error('squiggle: internal error');"
  ).body;
  var try_ = es.TryStatement(null, retBlock, catch_);
  var body = [try_].concat(internalError);
  var mainBlock = es.BlockStatement(null, body);
  var fn = es.FunctionExpression(null, null, [], mainBlock);
  return es.CallExpression(node.loc, fn, []);
}

module.exports = Try;
