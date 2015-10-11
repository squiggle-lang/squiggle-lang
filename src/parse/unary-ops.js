var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var word = H.word;

module.exports = function(ps) {
    var OtherOpExpr =
        P.alt(
            ps.CallOrGet,
            ps.BasicLiteral
        );

    var Not = word("not").then(OtherOpExpr).map(ast.Not);
    var Negate = word("-").then(OtherOpExpr).map(ast.Negate);

    var UnaryOps = P.alt(Not, Negate, OtherOpExpr);

    return UnaryOps;
};
