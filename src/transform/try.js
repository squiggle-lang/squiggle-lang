var esprima = require("esprima");

var es = require("../es");

function frozenArray(xs) {
    var fn = es.Identifier("$array");
    return es.CallExpression(fn, xs);
}

function Let(transform, node) {
    var expr = transform(node.expr);
    var ok = frozenArray([
        es.Literal("ok"),
        expr,
    ]);
    var fail = frozenArray([
        es.Literal("fail"),
        es.Identifier("$error")
    ]);
    var catch_ = es.CatchClause(
        es.Identifier("$error"),
        es.BlockStatement([
            es.ReturnStatement(fail)
        ])
    );
    var block = es.BlockStatement([
        es.ReturnStatement(ok)
    ]);
    var internalError = esprima.parse(
        "throw new $Error('squiggle: internal error');"
    ).body;
    var try_ = es.TryStatement(block, catch_);
    var body = [try_].concat(internalError);
    var fn = es.FunctionExpression(null, [], es.BlockStatement(body));
    return es.CallExpression(fn, []);
}

module.exports = Let;
