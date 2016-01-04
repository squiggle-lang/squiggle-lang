"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var spaced = H.spaced;
var keyword = H.keyword;
var word = H.word;
var ione = H.ione;
var indc = H.indc;

/// This helper is super dense, but basically it takes a "next step down in the
/// chain" parser and a string with space separated operator names that occur at
/// the same level of precedence, and creates a new parser that parses those
/// operators out with left-associativity, so that `lbo(lbo(Number, "+ -"), "*
/// /")` correctly parses multiplication and division as having higher priority
/// than addition and subtraction.
function lbo(array, e) {
    if (arguments.length < 2) {
        return lbo.bind(null, array);
    }
    var parsers = array.map(spaced);
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
        lbo([
            P.string("*"),
            P.string("/")
        ]),
        lbo([
            P.string("+"),
            P.string("-")
        ]),
        lbo([
            P.string("++"),
            P.string("~"),
            P.string("..")
        ]),
        lbo([
            P.string(">="),
            P.string("<="),
            P.string("<"),
            P.string(">"),
            P.string("=="),
            P.string("!="),
            keyword("has"),
            keyword("is"),
        ]),
        function(pp) {
            return ione(
                ast.Not,
                keyword("not")
                    .then(_)
                    .then(pp)
            ).or(pp);
        },
        lbo([
            keyword("and")
        ]),
        lbo([
            keyword("or")
        ])
    ];
    var OtherOpExpr = P.alt(ps.CallOrGet, ps.Literal);
    var Negate = ione(ast.Negate, word("-").then(OtherOpExpr));
    var End = Negate.or(OtherOpExpr);
    return stuff.reduce(combine, End);
};
