var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var word = H.word;
var ione = H.ione;

/// Various single word "unary operators".
/// These all happen before binary operators are parsed.
module.exports = function(ps) {
    var Try = ione(ast.Try, word("try").then(ps.Expr));
    var Throw = ione(ast.Throw, word("throw").then(ps.Expr));
    var Error_ = ione(ast.Error, word("error").then(ps.Expr));
    var Require = ione(ast.Require, word("require").then(ps.Expr));
    return P.alt(Try, Throw, Error_, Require);
};
