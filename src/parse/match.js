var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var wrap = H.wrap;
var word = H.word;
var ione = H.ione;
var iseq = H.iseq;
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
        ione(ast.MatchPatternSimple, ps.Identifier);

    var MatchPatternParenExpr =
        ione(ast.MatchPatternParenExpr, ps.ParenExpr);

    var MatchPatternLiteral =
        ione(ast.MatchPatternLiteral,
            P.alt(
                ps.Number,
                ps.String,
                ps.NamedLiteral
            ));

    var MatchPatternObjectPairBasic =
        iseq(ast.MatchPatternObjectPair,
            P.seq(
                ps.ObjectPairKey.skip(_),
                word(":").then(MatchPattern)
            ));

    var MatchPatternObjectPairShorthand =
        ps.Identifier
        .map(function(i) {
            var str = ast.String(i.index, i.data);
            var expr = ast.MatchPatternSimple(i.index, i);
            return ast.MatchPatternObjectPair(i.index, str, expr);
        });

    var MatchPatternObjectPair =
        P.alt(
            MatchPatternObjectPairBasic,
            MatchPatternObjectPairShorthand
        );

    var MatchPatternObject =
        ione(ast.MatchPatternObject,
            wrap("{", list0(ps.Separator, MatchPatternObjectPair), "}"));

    var MatchPatternArrayStrict =
        ione(ast.MatchPatternArray,
            wrap("[", list0(ps.Separator, MatchPattern), "]"));

    var MatchPatternArraySlurpy =
        iseq(ast.MatchPatternArraySlurpy,
            wrap(
                "[",
                P.seq(
                    MatchPattern.skip(ps.Separator).many(),
                    word("...").then(MatchPattern)
                ),
                "]"
            ));

    var MatchPatternArray =
        P.alt(
            MatchPatternArrayStrict,
            MatchPatternArraySlurpy
        );

    var MatchClause =
        iseq(ast.MatchClause,
            P.seq(
                word("case").then(MatchPattern),
                _.then(word("=>")).then(ps.Expr)
            ));

    return iseq(ast.Match,
        P.seq(
            word("match").then(ps.Expr).skip(_),
            MatchClause.skip(_).atLeast(1).skip(P.string("end"))
        ));
};
