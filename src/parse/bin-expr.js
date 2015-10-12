var P = require("parsimmon");

var H = require("../parse-helpers");
var ast = require("../ast");

var spaced = H.spaced;

var binOps = [
    "* /",
    "+ -",
    "++ ~",
    ">= <= < > == !=",
    "has is",
    "and or",
];

/// This helper is really dense, but basically it process a list of operators
/// and expressions, nesting them in a left-associative manner.

function leftBinOp(e, ops) {
    var aOperators = ops.split(" ");
    var sOperators = aOperators.map(P.string).map(spaced);
    var pOperator = P.alt.apply(null, sOperators).map(ast.Operator);
    var pAll = P.seq(e, P.seq(pOperator, e).many());
    return pAll.map(function(data) {
        return data[1].reduce(function(acc, x) {
            return ast.BinOp(x[0], acc, x[1]);
        }, data[0]);
    });
}

module.exports = function(ps) {
    // NOTE: This only works because all operators are left-associative. If there is
    // ever a right-associative operator in here, `reduce` will need to use a
    // different function. The only right-associate operators I can think of are
    // `cons` and exponentiation, neither of which I think I want to add.
    var BinExpr = binOps.reduce(leftBinOp, ps.UnaryOps);

    return BinExpr;
};
