var P = require("parsimmon");

module.exports = function(ps) {
    var Expr =
        P.alt(
            ps.Block,
            ps.If,
            ps.Let,
            ps.TopUnaryExpr,
            ps.Match,
            ps.BinExpr,
            ps.Literal
        );
    return Expr;
}
