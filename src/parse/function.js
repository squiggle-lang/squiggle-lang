var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var iseq = H.iseq;
var word = H.word;
var wrap = H.wrap;

module.exports = function(ps) {
    var OptionalName = ps.Identifier.or(P.of(null));
    return iseq(ast.Function,
        P.seq(
            word("fn").then(OptionalName).skip(_),
            wrap("(", ps.Parameters, ")").skip(_),
            ps.Expr
        ));
};
