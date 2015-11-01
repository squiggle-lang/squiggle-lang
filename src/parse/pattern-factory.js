var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var wrap = H.wrap;
var word = H.word;
var ione = H.ione;
var iseq = H.iseq;
var list0 = H.list0;

function patternFactory(type, ps) {
    var Pattern = P.lazy(function() {
        return P.alt(
            PatternArray,
            PatternObject,
            PatternLeaf
        );
    });

    var helpers = {
        Let: function() {
            return PatternSimple;
        },
        Match: function() {
            return P.alt(
                PatternLiteral,
                PatternSimple,
                PatternParenExpr
            );
        }
    };

    if (!helpers.hasOwnProperty(type)) {
        throw new Error("cannot make pattern factory for " + type);
    }

    var PatternLeaf = P.lazy(helpers[type]);

    var PatternSimple =
        ione(ast.PatternSimple, ps.Identifier);

    var PatternParenExpr =
        ione(ast.PatternParenExpr, ps.ParenExpr);

    var PatternLiteral =
        ione(ast.PatternLiteral,
            P.alt(
                ps.Number,
                ps.String,
                ps.NamedLiteral
            ));

    var PatternObjectPairBasic =
        iseq(ast.PatternObjectPair,
            P.seq(
                ps.ObjectPairKey.skip(_),
                word(":").then(Pattern)
            ));

    var PatternObjectPairShorthand =
        ps.Identifier
        .map(function(i) {
            var str = ast.String(i.index, i.data);
            var expr = ast.PatternSimple(i.index, i);
            return ast.PatternObjectPair(i.index, str, expr);
        });

    var PatternObjectPair =
        P.alt(
            PatternObjectPairBasic,
            PatternObjectPairShorthand
        );

    var PatternObject =
        ione(ast.PatternObject,
            wrap("{", list0(ps.Separator, PatternObjectPair), "}"));

    var PatternArrayStrict =
        ione(ast.PatternArray,
            wrap("[", list0(ps.Separator, Pattern), "]"));

    var PatternArraySlurpy =
        iseq(ast.PatternArraySlurpy,
            wrap(
                "[",
                P.seq(
                    Pattern.skip(ps.Separator).many(),
                    word("...").then(Pattern)
                ),
                "]"
            ));

    var PatternArray =
        P.alt(
            PatternArrayStrict,
            PatternArraySlurpy
        );

    return Pattern;
}

module.exports = patternFactory;
