"use strict";

var last = require('lodash/array/last');

function _walk(parents, obj, ast) {
  var enter = obj.enter || function() {};
  var exit = obj.exit || function() {};
  var recur = _walk.bind(null, parents, obj);
  var handlers = {
    Module: function(node) {
      node.statements.forEach(recur);
      node.exports.forEach(recur);
    },
    GetProperty: function(node) {
      recur(node.obj);
      recur(node.prop);
    },
    GetIndex: function(node) {
      recur(node.array);
      recur(node.arrayIndex);
    },
    GetMethod: function(node) {
      recur(node.obj);
      recur(node.prop);
    },
    CallMethod: function(node) {
      recur(node.obj);
      recur(node.prop);
      node.args.forEach(recur);
    },
    Call: function(node) {
      recur(node.f);
      node.args.forEach(recur);
    },
    ExprStmt: function(node) {
      recur(node.expression);
    },
    Function: function(node) {
      recur(node.parameters);
      recur(node.body);
    },
    Await: function(node) {
      recur(node.binding);
      recur(node.promise);
      recur(node.expression);
    },
    AwaitExpr: function(node) {
      recur(node.expression);
    },
    Declaration: function(node) {
      recur(node.identifier);
    },
    Parameters: function(node) {
      if (node.context) {
        recur(node.context);
      }
      node.positional.forEach(recur);
      if (node.slurpy) {
        recur(node.slurpy);
      }
    },
    Block: function(node) {
      node.statements.forEach(recur);
      recur(node.expression);
    },
    If: function(node) {
      recur(node.condition);
      recur(node.ifBranch);
      node.elseIfs.forEach(recur);
      recur(node.elseBranch);
    },
    ElseIf: function(node) {
      recur(node.condition);
      recur(node.branch);
    },
    Let: function(node) {
      recur(node.binding);
    },
    Binding: function(node) {
      recur(node.pattern);
      recur(node.value);
    },
    Array: function(node) {
      node.data.forEach(recur);
    },
    Object: function(node) {
      node.data.forEach(recur);
    },
    BinOp: function(node) {
      recur(node.operator);
      recur(node.left);
      recur(node.right);
    },
    Parameter: function(node) {
      recur(node.identifier);
    },
    Pair: function(node) {
      recur(node.key);
      recur(node.value);
    },
    IdentifierExpression: function(node) {
      recur(node.data);
    },
    ReplExpression: function(node) {
      recur(node.expression);
    },
    ReplBinding: function(node) {
      recur(node.binding);
    },
    Match: function(node) {
      recur(node.expression);
      node.clauses.forEach(recur);
    },
    MatchClause: function(node) {
      recur(node.pattern);
      recur(node.expression);
    },
    PatternSimple: function(node) {
      recur(node.identifier);
    },
    PatternParenExpr: function(node) {
      recur(node.expr);
    },
    PatternLiteral: function(node) {
      recur(node.data);
    },
    PatternArray: function(node) {
      node.patterns.forEach(recur);
    },
    PatternArraySlurpy: function(node) {
      node.patterns.forEach(recur);
      recur(node.slurp);
    },
    PatternObject: function(node) {
      node.pairs.forEach(recur);
    },
    PatternObjectPair: function(node) {
      recur(node.key);
      recur(node.value);
    },
    Error: function(node) {
      recur(node.message);
    },
    Throw: function(node) {
      recur(node.exception);
    },
    Try: function(node) {
      recur(node.expr);
    },
    Require: function(node) {
      recur(node.expr);
    },
    Not: function(node) {
      recur(node.expr);
    },
    Negate: function(node) {
      recur(node.expr);
    },
    Global: function(node) {},
    True: function(node) {},
    False: function(node) {},
    Null: function(node) {},
    Undefined: function(node) {},
    Operator: function(node) {},
    Identifier: function(node) {},
    Number: function(node) {},
    String: function(node) {},
  };
  enter(ast, last(parents));
  if (!(ast.type in handlers)) {
    throw new Error('unknown AST node type ' + JSON.stringify(ast));
  }
  parents.push(ast);
  handlers[ast.type](ast);
  parents.pop();
  exit(ast, last(parents));
}

function walk(obj, ast) {
  return _walk([], obj, ast);
}

module.exports = {
  walk: walk
};
