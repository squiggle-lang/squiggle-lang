"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var keyword = H.keyword;
var indc = H.indc;
var word = H.word;
var wrap = H.wrap;
var iseq = H.iseq;
var ione = H.ione;

function makeDefBinding(index, name, params, body) {
    var idx = indc(name, body);
    var fn = ast.Function(idx, name, params, body);
    return ast.Binding(index, ast.PatternSimple(name.loc, name), fn);
}

module.exports = function(ps) {
    var LetBinding =
        iseq(ast.Binding,
            P.seq(
                keyword("let")
                    .then(_)
                    .then(ps.LetPattern)
                    .skip(_),
                word("=")
                    .then(ps.Expr)
            ));

    var DefBinding =
        iseq(makeDefBinding,
            P.seq(
                keyword("def")
                    .then(_)
                    .then(ps.Identifier)
                    .skip(_),
                wrap("(", ps.Parameters, ")")
                    .skip(_)
                    .skip(keyword("do"))
                    .skip(_),
                ps.Block
                    .skip(_)
                    .skip(keyword("end"))
            ));

    return ione(ast.Let,
        P.alt(
            LetBinding,
            DefBinding
        ));
};
