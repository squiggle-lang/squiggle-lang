"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var keyword = H.keyword;
var ione = H.ione;
var iseq = H.iseq;

module.exports = function(ps) {
    var emptyPattern =
        ione(ast.PatternSimple,
            ione(ast.Identifier, P.of("_")));
    var NormalClause =
        P.seq(
            keyword("case").then(_).then(ps.MatchPattern),
            _.then(keyword("then").then(_)).then(ps.Block)
        );
    var ElseClause =
        P.seq(
            emptyPattern,
            _.then(keyword("else").then(_)).then(ps.Block)
        );
    var MatchClause =
        iseq(ast.MatchClause, NormalClause.or(ElseClause));
    return iseq(ast.Match,
        P.seq(
            keyword("match").then(_).then(ps.BinExpr),
            _.then(MatchClause).atLeast(1)
                .skip(_)
                .skip(keyword("end"))
        ));
};
