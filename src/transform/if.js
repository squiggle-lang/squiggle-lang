var ast = require("../ast");
var es = require("../es");

function bool(x) {
    return ast.Call(null, ast.Identifier(null, "$bool"), [x]);
}

function If(transform, node) {
    var p = transform(bool(node.p));
    var t = transform(node.t);
    var f = transform(node.f);
    return es.ConditionalExpression(node.loc, p, t, f);
}

module.exports = If;
