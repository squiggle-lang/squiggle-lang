"use strict";

var mapValues = require("lodash/object/mapValues");

var nm = require('./node-maker');

var almostEs = {
  Program: ['body'],
  Literal: ['value'],
  Identifier: ['name'],
  LogicalExpression: ['operator', 'left', 'right'],
  SequenceExpression: ['expressions'],
  ExpressionStatement: ['expression'],
  AssignmentExpression: ['operator', 'left', 'right'],
  MemberExpression: ['computed', 'object', 'property'],
  CallExpression: ['callee', 'arguments'],
  ConditionalExpression: ['test', 'consequent', 'alternate'],
  ArrayExpression: ['elements'],
  ReturnStatement: ['argument'],
  ThisExpression: [],
  UnaryExpression: ['prefix', 'operator', 'argument'],
  BlockStatement: ['body'],
  FunctionExpression: ['id', 'params', 'body'],
  VariableDeclaration: ['kind', 'declarations'],
  VariableDeclarator: ['id', 'init'],
  BinaryExpression: ['operator', 'left', 'right'],
  IfStatement: ['test', 'consequent', 'alternate'],
  TryStatement: ['block', 'handler'],
  CatchClause: ['param', 'body'],
  ThrowStatement: ['argument'],
  NewExpression: ['callee', 'arguments'],
};

function addLoc(array) {
  return ["loc"].concat(array);
}

var es = nm("es", mapValues(almostEs, addLoc));

module.exports = es;
