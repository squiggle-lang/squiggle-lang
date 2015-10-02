var es = require("../es");

function Require(transform, node) {
    var path = transform(node.expr);
    var id = es.Identifier("require");
    return es.CallExpression(id, [path]);
}

module.exports = Require;
