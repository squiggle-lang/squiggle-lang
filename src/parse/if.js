"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var iseq = H.iseq;
var keyword = H.keyword;

module.exports = function(ps) {
  var ElseIf = iseq(ast.ElseIf,
    P.seq(
      keyword("elseif").then(_).then(ps.Expr).skip(_),
      keyword("then").then(_).then(ps.Block).skip(_)
    ));
  return iseq(ast.If,
    P.seq(
      keyword("if").then(_).then(ps.Expr).skip(_),
      keyword("then").then(_).then(ps.Block).skip(_),
      ElseIf.many(),
      keyword("else").then(_).then(ps.Block).skip(_)
        .skip(keyword("end"))
    ));
};
