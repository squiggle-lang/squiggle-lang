var fileWrapper = require("../file-wrapper");
var es = require("../es");

function globalComputedEq(name, x) {
    var literallyThis = es.Literal("this");
    var f = es.Literal(false);
    var e = es.Identifier("eval");
    var indirectEval = es.LogicalExpression("||", f, e);
    var global = es.CallExpression(indirectEval, [literallyThis]);
    var memberExpr = es.MemberExpression(true, global, es.Literal(name));
    var assign = es.AssignmentExpression('=', memberExpr, x);
    return es.ExpressionStatement(assign);
}

function ReplBinding(transform, node) {
    var name = node.binding.identifier.data;
    var expr = transform(node.binding.value);
    return fileWrapper([globalComputedEq(name, expr)]);
}

module.exports = ReplBinding;
