var es = require("../es");

function Negate(transform, node) {
    var expr = transform(node.expr);
    var negate = es.Identifier(node.loc, "$negate");
    return es.CallExpression(null, negate, [expr]);
}

module.exports = Negate;
