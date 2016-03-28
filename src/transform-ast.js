"use strict";

var isObject = require("lodash/lang/isObject");

var jsonify = JSON.stringify;

var handlers = {
  'ast.Array': require("./transform/array"),
  'ast.BinOp': require("./transform/bin-op"),
  'ast.Block': require("./transform/block"),
  'ast.Call': require("./transform/call"),
  'ast.CallMethod': require("./transform/call-method"),
  'ast.Debugger': require("./transform/debugger"),
  'ast.Error': require("./transform/error"),
  'ast.ExprStmt': require("./transform/expr-stmt"),
  'ast.False': require("./transform/false"),
  'ast.Function': require("./transform/function"),
  'ast.GetIndex': require("./transform/get-index"),
  'ast.GetProperty': require("./transform/get-property"),
  'ast.Global': require("./transform/global"),
  'ast.Identifier': require("./transform/identifier"),
  'ast.IdentifierExpression': require("./transform/identifier-expression"),
  'ast.If': require("./transform/if"),
  'ast.Match': require("./transform/match"),
  'ast.Module': require("./transform/module"),
  'ast.Negate': require("./transform/negate"),
  'ast.Not': require("./transform/not"),
  'ast.Null': require("./transform/null"),
  'ast.Number': require("./transform/number"),
  'ast.Object': require("./transform/object"),
  'ast.Parameter': require("./transform/parameter"),
  'ast.ReplBinding': require("./transform/repl-expression"),
  'ast.ReplExpression': require("./transform/repl-expression"),
  'ast.Require': require("./transform/require"),
  'ast.String': require("./transform/string"),
  'ast.Throw': require("./transform/throw"),
  'ast.True': require("./transform/true"),
  'ast.Undefined': require("./transform/undefined"),
};

function transform(node) {
  if (!isObject(node)) {
    throw new Error("Not a node: " + jsonify(node));
  }
  if (handlers.hasOwnProperty(node.fullType)) {
    return handlers[node.fullType](transform, node);
  }
  throw new Error("Unknown AST node: " + jsonify(node));
}

module.exports = transform;
