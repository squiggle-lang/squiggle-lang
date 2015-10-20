var P = require("parsimmon");

var ast = require("../ast");
var inone = require("../parse-helpers").inone;

module.exports = function(ps) {
    var True = inone(ast.True, P.string("true"));
    var False = inone(ast.False, P.string("false"));
    var Null = inone(ast.Null, P.string("null"));
    var Undefined = inone(ast.Undefined, P.string("undefined"));
    return P.alt(True, False, Null, Undefined);
};
