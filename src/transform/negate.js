var es = require("../es");

function Negate(transform, node) {
    var expr = transform(node.expr);
    var negate = es.Identifier("$negate");
    return es.CallExpression(negate, [expr]);
}

module.exports = Negate;
