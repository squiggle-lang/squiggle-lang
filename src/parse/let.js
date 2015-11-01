var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var indc = H.indc;
var word = H.word;
var wrap = H.wrap;
var iseq = H.iseq;
var list1 = H.list1;

function makeDefBinding(index, name, params, body) {
    var idx = indc(name, body);
    var fn = ast.Function(idx, name, params, body);
    return ast.Binding(index, ast.PatternSimple(name.loc, name), fn);
}

module.exports = function(ps) {
    var LetBinding =
        iseq(ast.Binding,
            P.seq(
                word("let").then(ps.LetPattern).skip(_),
                word("=").then(ps.Expr)
            ));

    var DefBinding =
        iseq(makeDefBinding,
            P.seq(
                word("def").then(ps.Identifier).skip(_),
                wrap("(", ps.Parameters, ")").skip(_),
                word("=").then(ps.Expr)
            ));

    var Binding = LetBinding.or(DefBinding);
    var Bindings = list1(_, Binding);

    return iseq(ast.Let,
        P.seq(
            Bindings,
            _.then(word("in")).then(ps.Expr)
        ));
};
