var P = require("parsimmon");

var ast = require("../ast");
var ione = require("../parse-helpers").ione;

// TODO: Disallow keywords as identifiers.
var Identifier =
    ione(ast.Identifier,
        P.regex(/[_a-z][_a-z0-9]*/i)
        .desc("identifier")
    );

module.exports = function(ps) {
    return Identifier;
};
