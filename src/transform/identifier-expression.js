var es = require("../es");

function IdentifierExpression(transform, node) {
    var id = transform(node.data);
    var name = es.Literal(node.data.data);
    var ref = es.Identifier("$ref");
    return es.CallExpression(ref, [id, name]);
}

module.exports = IdentifierExpression;
