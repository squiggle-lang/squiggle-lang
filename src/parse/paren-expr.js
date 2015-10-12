var H = require("../parse-helpers");
var wrap = H.wrap;

module.exports = function(ps) {
    var ParenExpr = wrap("(", ps.Expr, ")");
    return ParenExpr;
};
