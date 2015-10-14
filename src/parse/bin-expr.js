var P = require("parsimmon");

var H = require("../parse-helpers");
var ast = require("../ast");

var spaced = H.spaced;
var word = H.word;
var ione = H.ione;
var indc = H.indc;

/// This helper is super dense, but basically it takes a "next step down in the
/// chain" parser and a string with space separated operator names that occur at
/// the same level of precedence, and creates a new parser that parses those
/// operators out with left-associativity, so that `lbo(lbo(Number, "+ -"), "*
/// /")` correctly parses multiplication and division as having higher priority
/// than addition and subtraction.
function lbo(ops, e) {
    if (arguments.length < 2) {
        return lbo.bind(null, ops);
    }
    var array = ops.split(" ");
    var parsers = array.map(P.string).map(spaced);
    var combined = ione(ast.Operator, P.alt.apply(null, parsers));
    var allTogether = P.seq(e, P.seq(combined, e).many());
    return allTogether.map(function(data) {
        return data[1].reduce(function(acc, x) {
            return ast.BinOp(indc(acc, x[1]), x[0], acc, x[1]);
        }, data[0]);
    });
}

function combine(parser, almostParser) {
    return almostParser(parser);
}

module.exports = function(ps) {
    var stuff = [
        lbo("* /"),
        lbo("+ -"),
        lbo("++ ~"),
        lbo(">= <= > < == != has is"),
        function(pp) {
            return word("not").then(pp)
                .map(ast.Not)
                .or(pp);
        },
        lbo("and"),
        lbo("or")
    ];
    var OtherOpExpr = P.alt(ps.CallOrGet, ps.Literal);
    var Negate = word("-").then(OtherOpExpr).map(ast.Negate);
    var End = Negate.or(OtherOpExpr);
    return stuff.reduce(combine, End);
};
