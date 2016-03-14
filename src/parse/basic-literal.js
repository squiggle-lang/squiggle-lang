"use strict";

var P = require("parsimmon");

module.exports = function(ps) {
  return P.alt(
    ps.Number,
    ps.String,
    ps.NamedLiteral
  );
};
