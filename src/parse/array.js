"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");
var ast = require("../ast");

var ione = H.ione;
var wrap = H.wrap;
var list0 = H.list0;

function FrozenArray(index, items) {
  return ast.Array(index, true, items);
}

function UnfrozenArray(index, items) {
  return ast.Array(index, false, items);
}

module.exports = function(ps) {
  return P.alt(
    ione(FrozenArray, wrap("[", list0(ps.Separator, ps.Expr), "]")),
    ione(UnfrozenArray, wrap("&[", list0(ps.Separator, ps.Expr), "]"))
  );
};
