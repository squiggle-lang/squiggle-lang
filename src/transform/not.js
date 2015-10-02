var es = require("../es");

function Not(transform, node) {
    var expr = transform(node.expr);
    var not = es.Identifier("$not");
    return es.CallExpression(not, [expr]);
}

module.exports = Not;
