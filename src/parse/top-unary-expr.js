var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var word = H.word;

/// Various single word "unary operators".
/// These all happen before binary operators are parsed.
module.exports = function(ps) {
    var Try = word("try").then(ps.Expr).map(ast.Try);
    var Throw = word("throw").then(ps.Expr).map(ast.Throw);
    var Error_ = word("error").then(ps.Expr).map(ast.Error);
    var Require = word("require").then(ps.Expr).map(ast.Require);
    return P.alt(Try, Throw, Error_, Require);
};
