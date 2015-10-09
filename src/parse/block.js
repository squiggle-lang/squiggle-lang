var ast = require("../ast");
var H = require("../parse-helpers");

var wrap = H.wrap;

module.exports = function(ps) {
    var Statement =
        ps.Expr.skip(ps.Terminator);

    var Block =
        wrap("do", Statement.atLeast(1), "end")
        .map(ast.Block);

    return Block;
};
