var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var ione = H.ione;
var wrap = H.wrap;
var spaced = H.spaced;

module.exports = function(ps) {
    var Terminator = spaced(P.string(";"));
    var Statement = ps.Expr.skip(Terminator);
    var Body = Statement.atLeast(1);
    return ione(ast.Block, wrap("do", Body, "end"));
};
