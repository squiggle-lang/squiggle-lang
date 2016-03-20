"use strict";

var P = require("parsimmon");

var _ = require("./whitespace")(null);
var ast = require("../ast");
var H = require("../parse-helpers");

var list0 = H.list0;
var wrap = H.wrap;
var word = H.word;
var iseq = H.iseq;
var ione = H.ione;
var indc = H.indc;

function almostSpready(maker) {
  return function(index, xs) {
    return function(x) {
      var index = indc(x.index, xs.index);
      return maker(index, x, xs);
    };
  };
}

function combine(index, expr, others) {
  return others.reduce(function(acc, x) {
    return x(acc);
  }, expr);
}

module.exports = function(ps) {
  var DotProp = _.then(word(".")).then(ps.IdentifierAsString);
  var BraceProp = wrap("{", ps.Expr, "}");
  var IndexProp = wrap("[", ps.Expr, "]");
  var Property = DotProp.or(BraceProp);
  var ArgList = wrap("(", list0(ps.Separator, ps.Expr), ")");
  var CallOrGet =
    P.alt(
      ione(almostSpready(ast.Call), ArgList),
      ione(almostSpready(ast.GetProperty), Property),
      ione(almostSpready(ast.GetIndex), IndexProp)
    );
  return iseq(combine,
    P.seq(
      ps.Literal,
      CallOrGet.many()
    ));
};
