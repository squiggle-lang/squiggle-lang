"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var keyword = H.keyword;
var ione = H.ione;
var word = H.word;
var iseq = H.iseq;

module.exports = function(ps) {
    return iseq(ast.Await,
        P.seq(
            keyword("await")
                .skip(_)
                .then(ps.Identifier)
                .skip(_),
            word("=")
                .then(ps.Expr)
                .skip(_),
            keyword("in")
                .then(_)
                .then(ione(ast.AwaitExpr, ps.Expr))
        )
    );
};
