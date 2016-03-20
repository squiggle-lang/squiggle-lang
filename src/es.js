"use strict";

var nm = require('./node-maker');

module.exports = nm("es", {
  ArrayExpression: ['loc', 'elements'],
  AssignmentExpression: ['loc', 'operator', 'left', 'right'],
  BinaryExpression: ['loc', 'operator', 'left', 'right'],
  BlockStatement: ['loc', 'body'],
  CallExpression: ['loc', 'callee', 'arguments'],
  CatchClause: ['loc', 'param', 'body'],
  ConditionalExpression: ['loc', 'test', 'consequent', 'alternate'],
  DebuggerStatement: ['loc'],
  ExpressionStatement: ['loc', 'expression'],
  FunctionExpression: ['loc', 'id', 'params', 'body'],
  Identifier: ['loc', 'name'],
  IfStatement: ['loc', 'test', 'consequent', 'alternate'],
  Literal: ['loc', 'value'],
  LogicalExpression: ['loc', 'operator', 'left', 'right'],
  MemberExpression: ['loc', 'computed', 'object', 'property'],
  NewExpression: ['loc', 'callee', 'arguments'],
  Program: ['loc', 'body'],
  ReturnStatement: ['loc', 'argument'],
  SequenceExpression: ['loc', 'expressions'],
  ThisExpression: ['loc'],
  ThrowStatement: ['loc', 'argument'],
  TryStatement: ['loc', 'block', 'handler'],
  UnaryExpression: ['loc', 'prefix', 'operator', 'argument'],
  VariableDeclaration: ['loc', 'kind', 'declarations'],
  VariableDeclarator: ['loc', 'id', 'init'],
});
