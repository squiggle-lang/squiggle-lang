var ast = require("../ast");
var es = require("../es");

function bool(x) {
    return ast.Call(ast.Identifier("$bool"), [x]);
}

function If(transform, node) {
    var p = transform(bool(node.p));
    var t = transform(node.t);
    var f = transform(node.f);
    return es.ConditionalExpression(p, t, f);
}

module.exports = If;
