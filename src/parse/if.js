var P = require("parsimmon");

var ast = require("../ast");

var _ = require("./whitespace")(null);

var H = require("../parse-helpers");
var word = H.word;
var spread = H.spread;

module.exports = function(ps) {
    var If =
        P.seq(
            word("if").then(ps.Expr).skip(_),
            word("then").then(ps.Expr).skip(_),
            word("else").then(ps.Expr)
        )
        .map(spread(ast.If));

    return If;
};
