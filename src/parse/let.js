var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var word = H.word;
var wrap = H.wrap;
var list1 = H.list1;
var spread = H.spread;

module.exports = function(ps) {
    var LetBinding =
        P.seq(
            word("let").then(ps.Identifier).skip(_),
            word("=").then(ps.Expr)
        ).map(spread(ast.Binding));

    var DefBinding =
        P.seq(
            word("def").then(ps.Identifier).skip(_),
            wrap("(", ps.Parameters, ")").skip(_),
            word("=").then(ps.Expr)
        ).map(spread(function(name, params, body) {
            var fn = ast.Function(name, params, body);
            return ast.Binding(name, fn);
        }));

    var Binding = LetBinding.or(DefBinding);

    var Bindings = list1(_, Binding);

    var Let =
        P.seq(
            Bindings,
            _.then(word("in")).then(ps.Expr)
        ).map(spread(ast.Let));

    return Let;
};
