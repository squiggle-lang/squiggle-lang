var P = require("parsimmon");

module.exports = function(ps) {
    var Literal =
        P.alt(
            ps.BasicLiteral,
            ps.Array,
            ps.Object,
            ps.Function,
            ps.IdentExpr,
            ps.ParenExpr
        ).desc("literal");
    return Literal;
}
