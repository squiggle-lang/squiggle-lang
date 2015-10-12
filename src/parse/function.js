var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var word = H.word;
var wrap = H.wrap;
var spread = H.spread;

module.exports = function(ps) {
    var OptionalName = ps.Identifier.or(P.of(null));
    return P.seq(
        word("fn").then(OptionalName).skip(_),
        wrap("(", ps.Parameters, ")").skip(_),
        ps.Expr
    )
    .map(spread(ast.Function));
};
