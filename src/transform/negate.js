var es = require("../es");

function Negate(transform, node) {
    var expr = transform(node.expr);
    if (typeof node.expr.data === "number") {
        var literal = es.Literal(node.loc, node.expr.data);
        return es.UnaryExpression(node.loc, true, "-", literal);
    } else {
        var negate = es.Identifier(node.loc, "$negate");
        return es.CallExpression(null, negate, [expr]);
    }
}

module.exports = Negate;
