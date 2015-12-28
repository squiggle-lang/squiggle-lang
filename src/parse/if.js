"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var iseq = H.iseq;
var word = H.word;

module.exports = function(ps) {
    var ElseIf = iseq(ast.ElseIf,
        P.seq(
            word("elseif").then(ps.Expr).skip(_),
            word("then").then(ps.Block).skip(_)
        ));
    return iseq(ast.If,
        P.seq(
            word("if").then(ps.Expr).skip(_),
            word("then").then(ps.Block).skip(_),
            ElseIf.many(),
            word("else").then(ps.Block).skip(_)
                .skip(P.string("end"))
        ));
};
