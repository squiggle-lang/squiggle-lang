var P = require("parsimmon");

module.exports = function(ps) {
    return P.alt(
        ps.Block,
        ps.If,
        ps.Let,
        ps.TopUnaryExpr,
        ps.Match,
        ps.BinExpr,
        ps.Literal
    );
};
