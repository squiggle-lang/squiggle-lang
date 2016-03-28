"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function bool(x) {
  return es.CallExpression(x.loc, helperNamed("aBoolean"), [x]);
}

// It would totally work to just generate code like `P ? X : Y`, but pretty
// printers don't tend to make nested usages of such even remotely readable, so
// we just use a function wrapper and normal if/else.

function If(transform, node) {
  var if_ = ifHelper(transform, node);
  var block = es.BlockStatement(null, [if_]);
  var fn = es.FunctionExpression(null, null, [], block);
  return es.CallExpression(null, fn, []);
}

function blockRet(transform, expr) {
  return es.BlockStatement(null, [
    es.ReturnStatement(
      expr.loc,
      transform(expr)
    )
  ]);
}

function ifHelper(transform, node) {
  var condition = bool(transform(node.condition));
  var ifBranch = blockRet(transform, node.ifBranch);
  var finalElseBranch = blockRet(transform, node.elseBranch);
  var elseBranch =
    node.elseIfs.reduce(function(branch, elseIf) {
      return es.IfStatement(
        elseIf.loc,
        bool(transform(elseIf.condition)),
        blockRet(transform, elseIf.branch),
        branch
      );
    }, finalElseBranch);
  return es.IfStatement(node.loc, condition, ifBranch, elseBranch);
}

module.exports = If;
