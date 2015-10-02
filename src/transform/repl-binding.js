var fileWrapper = require("../file-wrapper");
var es = require("../es");

function globalComputedEq(name, x) {
    var this_ = es.Literal("this");
    var false_ = es.Literal(false);
    var eval_ = es.Identifier("eval");
    var indirectEval = es.LogicalExpression("||", false_, eval_);
    var global = es.CallExpression(indirectEval, [this_]);
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
