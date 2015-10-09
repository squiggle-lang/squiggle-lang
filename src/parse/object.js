var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var wrap = H.wrap;
var list0 = H.list0;
var spread = H.spread;
var spaced = H.spaced;

module.exports = function(ps) {
    var ObjectPairNormal =
        P.seq(
            ps.ObjectPairKey,
            spaced(P.string(":")).then(ps.Expr)
        ).map(spread(ast.Pair));

    var ObjectPairShorthand =
        ps.Identifier
        .map(function(i) {
            var str = ast.String(i.data);
            var expr = ast.IdentifierExpression(i);
            return ast.Pair(str, expr);
        });

    var ObjectPair = P.alt(
        ObjectPairNormal,
        ObjectPairShorthand
    );

    var Object_ =
        wrap("{", list0(ps.Separator, ObjectPair), "}")
        .map(ast.Object);

    return Object_;
};
