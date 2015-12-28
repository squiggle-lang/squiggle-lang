"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");
var _ = require("./whitespace")(null);
var ast = require("../ast");

var word = H.word;
var iseq = H.iseq;

module.exports = function(ps) {
    var MatchClause =
        iseq(ast.MatchClause,
            P.seq(
                word("case").then(ps.MatchPattern),
                _.then(word("then")).then(ps.Block)
            ));

    return iseq(ast.Match,
        P.seq(
            word("match").then(ps.BinExpr),
            _.then(MatchClause).atLeast(1)
                .skip(_)
                .skip(P.string("end"))
        ));
};
