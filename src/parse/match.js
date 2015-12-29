"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var word = H.word;
var ione = H.ione;
var iseq = H.iseq;

module.exports = function(ps) {
    var emptyPattern =
        ione(ast.PatternSimple,
            ione(ast.Identifier, P.of("_")));
    var NormalClause =
        P.seq(
            word("case").then(ps.MatchPattern),
            _.then(word("then")).then(ps.Block)
        );
    var ElseClause =
        P.seq(
            emptyPattern,
            _.then(word("else")).then(ps.Block)
        );
    var MatchClause =
        iseq(ast.MatchClause, NormalClause.or(ElseClause));
    return iseq(ast.Match,
        P.seq(
            word("match").then(ps.BinExpr),
            _.then(MatchClause).atLeast(1)
                .skip(_)
                .skip(P.string("end"))
        ));
};
