var H = require("../parse-helpers");
var ast = require("../ast");

var ione = H.ione;
var wrap = H.wrap;
var list0 = H.list0;

module.exports = function(ps) {
    return ione(ast.Array, wrap("[", list0(ps.Separator, ps.Expr), "]"));
};
