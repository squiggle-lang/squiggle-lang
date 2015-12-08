var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var iseq = H.iseq;

module.exports = function(ps) {
    return iseq(ast.Block,
        P.seq(
            ps.Statement.skip(ps.Terminator).many(),
            ps.Expr
        )
    );
};
