var P = require("parsimmon");

module.exports = function(ps) {
    return P.alt(
        ps.BasicLiteral,
        ps.Array,
        ps.Object,
        ps.Function,
        ps.IdentExpr,
        ps.ParenExpr
    )
    .desc("literal");
};
