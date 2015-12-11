var P = require("parsimmon");

module.exports = function(ps) {
    return P.alt(
        ps.If,
        ps.TopUnaryExpr,
        ps.Await,
        ps.Match,
        ps.BinExpr
    );
};
