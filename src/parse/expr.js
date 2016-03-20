"use strict";

var P = require("parsimmon");

module.exports = function(ps) {
  return P.alt(
    ps.If,
    ps.DoBlock,
    ps.TopUnaryExpr,
    ps.Match,
    ps.BinExpr
  );
};
