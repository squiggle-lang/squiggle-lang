"use strict";

var esprima = require("esprima");
var L = require("lodash");

var es = require("../es");
var ph = require("./pattern-helpers");

function esDeclare(loc, id, expr) {
  if (!id) {
    throw new Error("invalid id");
  }
  return es.VariableDeclaration(loc, "var", [
    es.VariableDeclarator(null, id, expr)
  ]);
}

function bindingToDeclAndInit(transform, b) {
  if (b.pattern.type === "PatternSimple") {
    if (b.pattern.identifier.data === "_") {
      return unboundLetDeclAndInit(transform, b.value);
    } else {
      return simpleBindingToDeclAndInit(transform, b);
    }
  } else {
    return complexBindingToDeclAndInit(transform, b);
  }
}

function unboundLetDeclAndInit(transform, expr) {
  var stmt = es.ExpressionStatement(expr.loc, transform(expr));
  return {
    identifiers: [],
    initialization: stmt
  };
}

function simpleBindingToDeclAndInit(transform, b) {
  var ident = transform(b.pattern.identifier);
  var expr = transform(b.value);
  var init = esDeclare(ident.loc, ident, expr);
  return {
    identifiers: [ident],
    initialization: init
  };
}

function complexBindingToDeclAndInit(transform, b) {
  var throwUp =
    esprima.parse("throw new Error('destructuring failure');").body;
  var value = transform(b.value);
  var root = tmp;
  var pattern = b.pattern;
  var looksGood =
    ph.satisfiesPattern(transform, root, pattern);
  var assignTmp = esDeclare(null, tmp, value);
  var pluck = ph.pluckPattern(transform, root, pattern);
  var pairs = L.zip(pluck.identifiers, pluck.expressions);
  var assignments = pairs.map(function(x) {
    var id = x[0];
    var expr = x[1];
    return esDeclare(id.loc, id, expr);
  });
  var theCheck =
    es.IfStatement(
      null,
      looksGood,
      es.BlockStatement(null, assignments),
      es.BlockStatement(null, throwUp)
    );
  return {
    identifiers: L.map(pairs, 0),
    initialization: [assignTmp, theCheck]
  };
}

var undef = es.Identifier(null, "$undef");
var tmp = es.Identifier(null, "$tmp");

exports.bindingToDeclAndInit = bindingToDeclAndInit;
exports.tmp = tmp;
exports.undef = undef;
exports.esDeclare = esDeclare;
