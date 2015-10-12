var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var wrap = H.wrap;
var list0 = H.list0;
var spread = H.spread;
var spaced = H.spaced;

module.exports = function(ps) {
    var Normal =
        P.seq(
            ps.ObjectPairKey,
            spaced(P.string(":")).then(ps.Expr)
        ).map(spread(ast.Pair));

    var Shorthand =
        ps.Identifier
        .map(function(i) {
            var str = ast.String(i.data);
            var expr = ast.IdentifierExpression(i);
            return ast.Pair(str, expr);
        });

    var Pair = P.alt(Normal, Shorthand);
    var Pairs = list0(ps.Separator, Pair);

    return wrap("{", Pairs, "}").map(ast.Object);
};
