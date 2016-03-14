"use strict";

var ast = require("../ast");

var ione = require("../parse-helpers").ione;

module.exports = function(ps) {
  /// I'm not incredibly a fan of having IdentExpr, but it helps the linter
  /// know when an identifier is being used for its name vs when it's being
  /// used for the value it references.
  return ione(ast.IdentifierExpression, ps.Identifier);
};
