"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var keyword = H.keyword;
var ione = H.ione;

/// Various single word "unary operators".
/// These all happen before binary operators are parsed.
module.exports = function(ps) {
    var Try = ione(ast.Try, keyword("try").then(_).then(ps.Expr));
    var Throw = ione(ast.Throw, keyword("throw").then(_).then(ps.Expr));
    var Error_ = ione(ast.Error, keyword("error").then(_).then(ps.Expr));
    var Require = ione(ast.Require, keyword("require").then(_).then(ps.Expr));
    return P.alt(Try, Throw, Error_, Require);
};
