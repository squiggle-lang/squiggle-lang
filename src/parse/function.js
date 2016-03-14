"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var keyword = H.keyword;
var iseq = H.iseq;
var wrap = H.wrap;

module.exports = function(ps) {
  var OptionalName = ps.Identifier.or(P.of(null));
  return iseq(ast.Function,
    P.seq(
      keyword("fn").then(_).then(OptionalName).skip(_),
      wrap("(", ps.Parameters, ")").skip(_),
      ps.Expr
    ));
};
