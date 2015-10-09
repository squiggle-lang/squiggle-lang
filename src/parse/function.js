var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var word = H.word;
var wrap = H.wrap;
var spread = H.spread;

module.exports = function(ps) {
    var Function_ =
        P.seq(
            word("fn").then(ps.Identifier.or(P.of(null))),
            _.then(wrap("(", ps.Parameters, ")")),
            _.then(ps.Expr)
        ).map(spread(ast.Function));
    return Function_;
};
