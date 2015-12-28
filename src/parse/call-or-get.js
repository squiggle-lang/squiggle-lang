"use strict";

var P = require("parsimmon");

var _ = require("./whitespace")(null);
var ast = require("../ast");
var H = require("../parse-helpers");

var list0 = H.list0;
var wrap = H.wrap;
var word = H.word;
var iseq = H.iseq;
var ione = H.ione;
var indc = H.indc;

function almostSpready(maker) {
    return function(index, xs) {
        return function(x) {
            var index = indc(x.index, xs.index);
            return maker(index, x, xs);
        };
    };
}

function combine(index, expr, others) {
    return others.reduce(function(acc, x) {
        return x(acc);
    }, expr);
}

module.exports = function(ps) {
    var DotProp = _.then(word(".")).then(ps.IdentifierAsString);
    var BracketProp = wrap("[", ps.Expr, "]");
    var Property = DotProp.or(BracketProp);
    /// I think so far I'm feeling ok about `foo::bar` as a syntax. I think to
    /// fit in with pattern matching expressions vs literals, the syntax for
    /// getting a bound method based on a computed value could be `foo::(bar)`,
    /// if I end up implementing that.
    var BoundMethod = word("::").then(ps.IdentifierAsString);
    var ArgList = wrap("(", list0(ps.Separator, ps.Expr), ")");
    var CallGetOrBind =
        P.alt(
            ione(almostSpready(ast.Call), ArgList),
            ione(almostSpready(ast.GetProperty), Property),
            ione(almostSpready(ast.GetMethod), BoundMethod)
        );
    return iseq(combine,
        P.seq(
            ps.Literal,
            CallGetOrBind.many()
        ));
};
