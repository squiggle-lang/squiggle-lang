"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var wrap = H.wrap;
var ione = H.ione;
var iseq = H.iseq;
var list0 = H.list0;
var spaced = H.spaced;

function FrozenObj(index, pairs) {
  return ast.Object(index, true, pairs);
}

function UnfrozenObj(index, pairs) {
  return ast.Object(index, false, pairs);
}

module.exports = function(ps) {
  var Normal =
    iseq(ast.Pair,
      P.seq(
        ps.ObjectPairKey,
        spaced(P.string(":")).then(ps.Expr)
      )
    );

  var Shorthand =
    ps.Identifier
    .map(function(i) {
      var str = ast.String(null, i.data);
      var expr = ast.IdentifierExpression(i.index, i);
      return ast.Pair(null, str, expr);
    });

  var Pair = P.alt(Normal, Shorthand);
  var Pairs = list0(ps.Separator, Pair);

  return P.alt(
    ione(UnfrozenObj, wrap("&{", Pairs, "}")),
    ione(FrozenObj, wrap("{", Pairs, "}"))
  );
};
