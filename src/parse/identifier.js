var P = require("parsimmon");

var ast = require("../ast");

// TODO: Disallow keywords as identifiers.
var Identifier =
    P.regex(/[_a-z][_a-z0-9]*/i)
    .desc("identifier")
    .map(ast.Identifier);

module.exports = function(ps) {
    return Identifier;
};
