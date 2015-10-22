var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var ione = H.ione;
var word = H.word;
var iseq = H.iseq;

module.exports = function(ps) {
    return iseq(ast.Await,
        P.seq(
            word("await").skip(_).then(ps.Identifier).skip(_),
            word("=").then(ps.Expr).skip(_),
            word("in").then(ione(ast.AwaitExpr, ps.Expr))
        )
    );
};
