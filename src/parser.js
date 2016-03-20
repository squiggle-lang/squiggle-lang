"use strict";

var parsimmonSalad = require("./parsimmon-salad");

var ps = parsimmonSalad({
  _: require("./parse/whitespace"),
  Literal: require("./parse/literal"),
  Statement: require("./parse/statement"),
  Expr: require("./parse/expr"),
  If: require("./parse/if"),
  Terminator: require("./parse/terminator"),
  Debugger: require("./parse/debugger"),
  DoBlock: require("./parse/do-block"),
  Block: require("./parse/block"),
  Number: require("./parse/number"),
  String: require("./parse/string"),
  Declaration: require("./parse/declaration"),
  Parameters: require("./parse/parameters"),
  Function: require("./parse/function"),
  BasicLiteral: require("./parse/basic-literal"),
  BinExpr: require("./parse/bin-expr"),
  Let: require("./parse/let"),
  CallOrGet: require("./parse/call-or-get"),
  Identifier: require("./parse/identifier"),
  Name: require("./parse/name"),
  Match: require("./parse/match"),
  Object: require("./parse/object"),
  Array: require("./parse/array"),
  MatchPattern: require("./parse/match-pattern"),
  LetPattern: require("./parse/let-pattern"),
  IdentifierAsString: require("./parse/identifier-as-string"),
  ObjectPairKey: require("./parse/object-pair-key"),
  Module: require("./parse/module"),
  NamedLiteral: require("./parse/named-literal"),
  TopUnaryExpr: require("./parse/top-unary-expr"),
  Separator: require("./parse/separator"),
  IdentExpr: require("./parse/ident-expr"),
  ParenExpr: require("./parse/paren-expr")
});

module.exports = ps;
