var P = require("parsimmon");

var ast = require("../ast");

module.exports = function(ps) {
    var True = P.string("true").result(ast.True());
    var False = P.string("false").result(ast.False());
    var Null = P.string("null").result(ast.Null());
    var Undefined = P.string("undefined").result(ast.Undefined());
    return P.alt(True, False, Null, Undefined);
};
