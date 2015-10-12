var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var wrap = H.wrap;
var word = H.word;
var spread = H.spread;
var list0 = H.list0;

/// Pattern matching section is kinda huge because it mirrors much of the rest
/// of the language, but produces different AST nodes, and is slightly
/// different.
module.exports = function(ps) {
    var MatchPattern = P.lazy(function() {
        return P.alt(
            MatchPatternArray,
            MatchPatternObject,
            MatchPatternLiteral,
            MatchPatternSimple,
            MatchPatternParenExpr
        );
    });

    var MatchPatternSimple =
        ps.Identifier.map(ast.MatchPatternSimple);

    var MatchPatternParenExpr =
        ps.ParenExpr.map(ast.MatchPatternParenExpr);

    var MatchPatternLiteral =
        P.alt(
            ps.Number,
            ps.String,
            ps.NamedLiteral
        )
        .map(ast.MatchPatternLiteral);

    var MatchPatternObjectPairBasic =
        P.seq(
            ps.ObjectPairKey.skip(_),
            word(":").then(MatchPattern)
        )
        .map(spread(ast.MatchPatternObjectPair));

    var MatchPatternObjectPairShorthand =
        ps.Identifier
        .map(function(i) {
            var str = ast.String(i.data);
            var expr = ast.MatchPatternSimple(i);
            return ast.MatchPatternObjectPair(str, expr);
        });

    var MatchPatternObjectPair =
        P.alt(
            MatchPatternObjectPairBasic,
            MatchPatternObjectPairShorthand
        );

    var MatchPatternObject =
        wrap("{", list0(ps.Separator, MatchPatternObjectPair), "}")
        .map(ast.MatchPatternObject);

    var MatchPatternArrayStrict =
        wrap("[", list0(ps.Separator, MatchPattern), "]")
        .map(ast.MatchPatternArray);

    var MatchPatternArraySlurpy =
        wrap(
            "[",
            P.seq(
                MatchPattern.skip(ps.Separator).many(),
                word("...").then(MatchPattern)
            ),
            "]"
        )
        .map(spread(ast.MatchPatternArraySlurpy));

    var MatchPatternArray = P.alt(
        MatchPatternArrayStrict,
        MatchPatternArraySlurpy
    );

    var MatchClause =
        P.seq(
            word("case").then(MatchPattern),
            _.then(word("=>")).then(ps.Expr)
        ).map(spread(ast.MatchClause));

    var Match =
        P.seq(
            word("match").then(ps.Expr).skip(_),
            MatchClause.atLeast(1).skip(_).skip(P.string("end"))
        ).map(spread(ast.Match));

    return Match;
};
