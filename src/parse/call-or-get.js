var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var list0 = H.list0;
var wrap = H.wrap;
var word = H.word;
var spread = H.spread;

function almostSpready(maker) {
    return function(xs) {
        return function(x) {
            return maker(x, xs);
        };
    };
}

module.exports = function(ps) {
    var DotProp = word(".").then(ps.IdentifierAsString);
    var BracketProp = wrap("[", ps.Expr, "]");
    var Property = DotProp.or(BracketProp);
    /// I think so far I'm feeling ok about `foo::bar` as a syntax. I think to
    /// fit in with pattern matching expressions vs literals, the syntax for
    /// getting a bound method based on a computed value could be `foo::(bar)`,
    /// if I end up implementing that.
    var BoundMethod = word("::").then(ps.IdentifierAsString);
    var ArgList = wrap("(", list0(ps.Separator, ps.Expr), ")");
    var CallOrGet =
        P.seq(
            ps.Literal,
            P.alt(
                ArgList.map(almostSpready(ast.Call)),
                Property.map(almostSpready(ast.GetProperty)),
                BoundMethod.map(almostSpready(ast.GetMethod))
            ).many()
        )
        .map(spread(function(expr, others) {
            return others.reduce(function(acc, x) {
                return x(acc);
            }, expr);
        }));
    return CallOrGet;
};
