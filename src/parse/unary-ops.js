var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var word = H.word;

module.exports = function(ps) {
    var Not = word("not").then(ps.OtherOpExpr).map(ast.Not);
    var Negate = word("-").then(ps.OtherOpExpr).map(ast.Negate);

    var UnaryOps = P.alt(Not, Negate, ps.OtherOpExpr);

    return UnaryOps;
};
